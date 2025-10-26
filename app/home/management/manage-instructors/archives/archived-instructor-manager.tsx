"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import {
  AcademicLevel,
  AcademicQualification,
  Instructor,
  InstructorStatus,
} from "@prisma/client";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  DataTableSection,
  DataTableSkeleton,
} from "@/ui/components/data-table-components";

import useTableColumns from "./hooks/use-table-columns";
import { TableToolbar } from "./components/table-toolbar";
import TableComponent from "./components/table-component";
import { useInstructorTable } from "./hooks/use-instructor-table";
import {
  ACADEMIC_LEVELS_API,
  ACADEMIC_QUALIFICATIONS_API,
  INSTRUCTORS_API,
} from "@/lib/api/api-endpoints";
import ArchiveDialog from "@/ui/components/table/archive-dialog";
import BulkArchiveDialog from "@/ui/components/table/bulk-archive-dialog";
import FailedArchiveDialog from "@/ui/components/table/failed-archive-dialog";
import DeleteDialog from "@/ui/components/table/delete-dialog";
import BulkDeleteDialog from "@/ui/components/table/bulk-delete-dialog";
import FailedDeleteDialog from "@/ui/components/table/failed-delete-dialog";
import RestoreDialog from "@/ui/components/table/restore-dialog";
import BulkRestoreDialog from "@/ui/components/table/bulk-restore-dialog";

// types
export type InstructorRow = Instructor & {
  academicQualification?: AcademicQualification;
};

export type FormData = {
  id?: number;
  name?: string;
  status?: InstructorStatus;
  academicQualificationId?: number;
} | null;

export type TableState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  pagination: PaginationState;
  globalFilter: string;
  selectedRowsCount: number;
};

// constants
const INITIAL_PAGINATION = { pageIndex: 0, pageSize: 10 };

// component
export default function InstructorManager() {
  const [tableState, setTableState] = useState<TableState>({
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    pagination: INITIAL_PAGINATION,
    globalFilter: "",
    selectedRowsCount: 0,
  });

  const [formData, setFormData] = useState<FormData>(null);

  const instructorLevelApi = createApiClient<Instructor>(
    `${INSTRUCTORS_API}/archived`
  );
  const academicQualificationApi = createApiClient<AcademicLevel>(
    ACADEMIC_QUALIFICATIONS_API
  );
  const entityManagement = useManageEntities<Instructor>({
    apiService: { fetch: instructorLevelApi.getAll },
    relatedApiServices: [
      { key: "academicQualification", fetch: academicQualificationApi.getAll },
    ],
  });

  const academicQualifications =
    entityManagement.relatedData.academicQualification || [];

  const academicQualificationOptions = academicQualifications
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((al) => ({
      label: al.name,
      value: al.id,
    }));

  const statusOptions = Object.values(InstructorStatus).map((type) => ({
    value: type,
    label: type,
  }));

  const columns = useTableColumns({
    onRestore: handleRestore,
    onDelete: handleDelete,
  });

  const table = useInstructorTable(
    entityManagement.data,
    columns,
    tableState,
    setTableState
  );

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  function handleDelete(item: InstructorRow) {
    setFormData({ id: item.id, name: item.name });
    entityManagement.setIsDeleteDialogOpen(true);
  }

  function handleRestore(item: InstructorRow) {
    setFormData({ id: item.id, name: item.name });
    entityManagement.setIsRestoreDialogOpen(true);
  }

  async function handleSingleDelete() {
    if (!formData?.id) {
      toast.error(`Error deleting ${formData?.name ?? "item"}: Invalid ID`);
      entityManagement.setIsDeleteDialogOpen(false);
      return;
    }

    entityManagement.setIsDeleting(true);
    try {
      const response = await fetch(`${INSTRUCTORS_API}/${formData.id}`, {
        method: "DELETE",
      });

      if (response.status === 404) {
        throw new Error("Item not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error ?? "Response Error: Failed to delete item.";
        throw new Error(msg);
      }

      toast.success(`${formData.name ?? "Item"} deleted successfully`);
      entityManagement.fetchData();
      entityManagement.setIsDeleteDialogOpen(false);
      setFormData(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error(`Error deleting item:`, error);
    } finally {
      entityManagement.setIsDeleting(false);
      table.resetRowSelection();
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;

    entityManagement.setIsDeletingSelected(true);

    try {
      const deletePromises = selectedIds.map((id) =>
        fetch(`${INSTRUCTORS_API}/${id}`, { method: "DELETE" }).then(
          async (res) => {
            if (res.status === 404) throw new Error("Item not found");
            const data = await res.json();
            if (!res.ok)
              throw new Error(data?.error ?? "Failed to delete item");
            return true;
          }
        )
      );

      const results = await Promise.allSettled(deletePromises);

      const successfulDeletes = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      const failedDeletes = results.filter(
        (r) => r.status === "rejected"
      ).length;

      if (successfulDeletes > 0) {
        toast.success(`${successfulDeletes} item(s) deleted successfully`);
      }

      if (failedDeletes > 0) {
        const failedReasons = results
          .filter((r) => r.status === "rejected")
          .map((r) => (r as PromiseRejectedResult).reason.message);

        entityManagement.setFailedReasons(failedReasons);
        entityManagement.setFailedCount(failedDeletes);
        entityManagement.setFailedDialogOpen(true);
      }

      entityManagement.fetchData();
      entityManagement.setIsDeleteSelectedDialogOpen(false);
    } catch (err) {
      console.error("Error deleting items:", err);
      toast.error("Unexpected error occurred");
    } finally {
      entityManagement.setIsDeletingSelected(false);
      table.resetRowSelection();
    }
  }

  async function handleSingleRestore() {
    if (!formData?.id) {
      toast.error(`Error restoring ${formData?.name ?? "item"}: Invalid ID`);
      entityManagement.setIsRestoreDialogOpen(false);
      return;
    }

    entityManagement.setIsRestoring(true);
    try {
      const response = await fetch(`${INSTRUCTORS_API}/${formData.id}`, {
        method: "PATCH",
      });

      if (response.status === 404) {
        throw new Error("Item not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error ?? "Response Error: Failed to restore item.";
        throw new Error(msg);
      }

      toast.success(`${formData.name ?? "Item"} restored successfully`);
      entityManagement.fetchData();
      entityManagement.setIsRestoreDialogOpen(false);
      setFormData(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error(`Error restoring item:`, error);
    } finally {
      entityManagement.setIsRestoring(false);
      table.resetRowSelection();
    }
  }

  async function handleBulkRestore() {
    if (selectedIds.length === 0) return;

    entityManagement.setIsRestoringSelected(true);

    try {
      const restorePromises = selectedIds.map((id) =>
        fetch(`${INSTRUCTORS_API}/${id}`, { method: "PATCH" }).then(
          async (res) => {
            if (res.status === 404) throw new Error("Item not found");
            const data = await res.json();
            if (!res.ok)
              throw new Error(data?.error ?? "Failed to restore item");
            return true;
          }
        )
      );

      const results = await Promise.allSettled(restorePromises);

      const successfulRestores = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      const failedRestores = results.filter(
        (r) => r.status === "rejected"
      ).length;

      if (successfulRestores > 0) {
        toast.success(`${successfulRestores} item(s) restored successfully`);
      }

      if (failedRestores > 0) {
        const failedReasons = results
          .filter((r) => r.status === "rejected")
          .map((r) => (r as PromiseRejectedResult).reason.message);

        entityManagement.setFailedReasons(failedReasons);
        entityManagement.setFailedCount(failedRestores);
        entityManagement.setFailedDialogOpen(true);
      }

      entityManagement.fetchData();
      entityManagement.setIsRestoreSelectedDialogOpen(false);
    } catch (err) {
      console.error("Error restoring items:", err);
      toast.error("Unexpected error occurred");
    } finally {
      entityManagement.setIsRestoringSelected(false);
      table.resetRowSelection();
    }
  }

  return (
    <DataTableSection>
      {entityManagement.isLoading ? (
        <DataTableSkeleton columnCount={4} rowCount={5} />
      ) : (
        <DataTableSection>
          <TableToolbar
            table={table}
            tableState={tableState}
            setTableState={setTableState}
            entityData={entityManagement.data}
            selectedRowsCount={tableState.selectedRowsCount}
            entityManagement={entityManagement}
          />

          <TableComponent
            table={table}
            tableState={tableState}
            setTableState={setTableState}
          />

          <DeleteDialog
            isOpen={entityManagement.isDeleteDialogOpen}
            onClose={() => entityManagement.setIsDeleteDialogOpen(false)}
            itemName={formData?.name}
            onConfirm={handleSingleDelete}
            isDeleting={entityManagement.isDeleting}
          />

          <BulkDeleteDialog
            isOpen={entityManagement.isDeleteSelectedDialogOpen}
            onClose={() =>
              entityManagement.setIsDeleteSelectedDialogOpen(false)
            }
            selectedCount={tableState.selectedRowsCount}
            onConfirm={handleBulkDelete}
            isDeleting={entityManagement.isDeletingSelected}
            entityManagement={entityManagement}
          />

          <RestoreDialog
            isOpen={entityManagement.isRestoreDialogOpen}
            onClose={() => entityManagement.setIsRestoreDialogOpen(false)}
            itemName={formData?.name}
            onConfirm={handleSingleRestore}
            isRestoring={entityManagement.isRestoring}
          />

          <BulkRestoreDialog
            isOpen={entityManagement.isRestoreSelectedDialogOpen}
            onClose={() =>
              entityManagement.setIsRestoreSelectedDialogOpen(false)
            }
            selectedCount={tableState.selectedRowsCount}
            onConfirm={handleBulkRestore}
            isRestoring={entityManagement.isRestoringSelected}
            entityManagement={entityManagement}
          />
        </DataTableSection>
      )}

      <FailedDeleteDialog
        isOpen={entityManagement.failedDialogOpen}
        onClose={() => entityManagement.setFailedDialogOpen(false)}
        failedCount={entityManagement.failedCount}
        failedReasons={entityManagement.failedReasons}
      />
    </DataTableSection>
  );
}
