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
import FormDialog from "./components/form-dialog";
import { useInstructorTable } from "./hooks/use-instructor-table";
import {
  ACADEMIC_LEVELS_API,
  ACADEMIC_QUALIFICATIONS_API,
  INSTRUCTORS_API,
} from "@/lib/api/api-endpoints";
import ArchiveDialog from "@/ui/components/table/archive-dialog";
import BulkArchiveDialog from "@/ui/components/table/bulk-archive-dialog";
import FailedArchiveDialog from "@/ui/components/table/failed-archive-dialog";

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

  const instructorLevelApi = createApiClient<Instructor>(INSTRUCTORS_API);
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
    onEdit: handleEdit,
    onArchive: handleArchive,
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

  function handleAdd() {
    setFormData(null);
    entityManagement.setIsFormDialogOpen(true);
  }

  function handleEdit(item: InstructorRow) {
    setFormData({
      id: item.id,
      name: item.name,
      status: item.status,
      academicQualificationId: item.academicQualificationId,
    });
    entityManagement.setIsFormDialogOpen(true);
  }

  function handleArchive(item: InstructorRow) {
    setFormData({ id: item.id, name: item.name });
    entityManagement.setIsArchiveDialogOpen(true);
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();

    if (!formData || !validateFormData(formData)) {
      return;
    }

    const isUpdate = Boolean(formData.id);
    const url = isUpdate
      ? `${INSTRUCTORS_API}/${formData.id}`
      : INSTRUCTORS_API;

    entityManagement.setIsSubmitting(true);

    try {
      const response = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Response error");
      }

      toast.success(isUpdate ? "Instructor updated" : "Instructor added");
      entityManagement.fetchData();
      entityManagement.setIsFormDialogOpen(false);
      setFormData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error(message);
      console.error("Error saving instructor:", err);
    } finally {
      entityManagement.setIsSubmitting(false);
      table.resetRowSelection();
    }
  }

  async function handleSingleArchive() {
    if (!formData?.id) {
      toast.error(`Error archiving ${formData?.name ?? "item"}: Invalid ID`);
      entityManagement.setIsArchiveDialogOpen(false);
      return;
    }

    entityManagement.setIsArchiving(true);
    try {
      const response = await fetch(`${INSTRUCTORS_API}/${formData.id}`, {
        method: "DELETE",
      });

      if (response.status === 404) {
        throw new Error("Item not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error ?? "Response Error: Failed to archive item.";
        throw new Error(msg);
      }

      toast.success(`${formData.name ?? "Item"} archived successfully`);
      entityManagement.fetchData();
      entityManagement.setIsArchiveDialogOpen(false);
      setFormData(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error(`Error archiving item:`, error);
    } finally {
      entityManagement.setIsArchiving(false);
      table.resetRowSelection();
    }
  }

  async function handleBulkArchive() {
    if (selectedIds.length === 0) return;

    entityManagement.setIsArchivingSelected(true);

    try {
      const archivePromises = selectedIds.map((id) =>
        fetch(`${INSTRUCTORS_API}/${id}`, { method: "DELETE" }).then(
          async (res) => {
            if (res.status === 404) throw new Error("Item not found");
            const data = await res.json();
            if (!res.ok)
              throw new Error(data?.error ?? "Failed to archive item");
            return true;
          }
        )
      );

      const results = await Promise.allSettled(archivePromises);

      const successfulArchives = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      const failedArchives = results.filter(
        (r) => r.status === "rejected"
      ).length;

      if (successfulArchives > 0) {
        toast.success(`${successfulArchives} item(s) archived successfully`);
      }

      if (failedArchives > 0) {
        const failedReasons = results
          .filter((r) => r.status === "rejected")
          .map((r) => (r as PromiseRejectedResult).reason.message);

        entityManagement.setFailedReasons(failedReasons);
        entityManagement.setFailedCount(failedArchives);
        entityManagement.setFailedDialogOpen(true);
      }

      entityManagement.fetchData();
      entityManagement.setIsArchiveSelectedDialogOpen(false);
    } catch (err) {
      console.error("Error archiving items:", err);
      toast.error("Unexpected error occurred");
    } finally {
      entityManagement.setIsArchivingSelected(false);
      table.resetRowSelection();
    }
  }

  function validateFormData(data: FormData): boolean {
    if (!data) return false;

    const validations = [
      { field: data.name, message: "Instructor Name is required" },
      { field: data.status, message: "Status is required" },
      {
        field: data.academicQualificationId,
        message: "Academic Qualification is required",
      },
    ];

    for (const { field, message } of validations) {
      if (!field) {
        toast.error(message);
        return false;
      }
    }

    return true;
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
            onAdd={handleAdd}
            onBulkArchive={() =>
              entityManagement.setIsArchiveSelectedDialogOpen(true)
            }
            entityManagement={entityManagement}
          />

          <TableComponent
            table={table}
            tableState={tableState}
            setTableState={setTableState}
          />

          <FormDialog
            academicQualificationOptions={academicQualificationOptions}
            statusOptions={statusOptions}
            isOpen={entityManagement.isFormDialogOpen}
            onClose={() => {
              entityManagement.setIsFormDialogOpen(false);
              setFormData(null);
            }}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleFormSubmit}
            isSubmitting={entityManagement.isSubmitting}
          />

          <ArchiveDialog
            isOpen={entityManagement.isArchiveDialogOpen}
            onClose={() => entityManagement.setIsArchiveDialogOpen(false)}
            itemName={formData?.name}
            onConfirm={handleSingleArchive}
            isArchiving={entityManagement.isArchiving}
          />

          <BulkArchiveDialog
            isOpen={entityManagement.isArchiveSelectedDialogOpen}
            onClose={() =>
              entityManagement.setIsArchiveSelectedDialogOpen(false)
            }
            selectedCount={tableState.selectedRowsCount}
            onConfirm={handleBulkArchive}
            isArchiving={entityManagement.isArchivingSelected}
            entityManagement={entityManagement}
          />
        </DataTableSection>
      )}

      <FailedArchiveDialog
        isOpen={entityManagement.failedDialogOpen}
        onClose={() => entityManagement.setFailedDialogOpen(false)}
        failedCount={entityManagement.failedCount}
        failedReasons={entityManagement.failedReasons}
      />
    </DataTableSection>
  );
}
