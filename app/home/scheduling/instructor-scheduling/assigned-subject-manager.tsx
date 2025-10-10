"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import { SCHEDULED_INSTRUCTORS_API } from "@/lib/api/api-endpoints";
import { formatTime } from "@/lib/schedule-utils";
import {
  Instructor,
  Room,
  ScheduledInstructor,
  ScheduledSubject,
  Section,
  Subject,
} from "@prisma/client";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAssignedSubjectTable } from "./hooks/assigned/use-assigned-subject-table";
import useTableColumns from "./hooks/assigned/use-table-columns";
import {
  DataTableSection,
  DataTableSkeleton,
} from "@/ui/components/data-table-components";
import { TableToolbar } from "./components/assigned/table-toolbar";
import TableComponent from "./components/assigned/table-component";
import DeleteDialog from "@/ui/components/table/delete-dialog";

export type ScheduledInstructorRow = ScheduledInstructor & {
  instructor: Instructor;
  scheduledSubject: ScheduledSubject & {
    room: Room;
    subject: Subject;
    section: Section;
  };
};

export type TableState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  pagination: PaginationState;
  globalFilter: string;
  selectedRowsCount: number;
};

type DeleteData = {
  id?: number;
  placeholder?: string;
} | null;

const INITIAL_PAGINATION = { pageIndex: 0, pageSize: 10 };

export default function AssignedSubjectManager({
  onChange,
  refreshKey,
}: {
  onChange: () => void;
  refreshKey: number;
}) {
  const [deleteData, setDeleteData] = useState<DeleteData>(null);

  const [tableState, setTableState] = useState<TableState>({
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    pagination: INITIAL_PAGINATION,
    globalFilter: "",
    selectedRowsCount: 0,
  });

  const scheduledInstructorApi = createApiClient<ScheduledInstructorRow>(
    SCHEDULED_INSTRUCTORS_API
  );

  const entityManagement = useManageEntities<ScheduledInstructorRow>({
    apiService: { fetch: scheduledInstructorApi.getAll },
  });

  useEffect(() => {
    entityManagement.fetchData();
  }, [refreshKey]);

  const columns = useTableColumns({ onDelete: handleDelete });

  const table = useAssignedSubjectTable(
    entityManagement.data,
    columns,
    tableState,
    setTableState
  );

  function handleDelete(item: ScheduledInstructorRow) {
    setDeleteData({
      id: item.id,
      placeholder: `${item.instructor.name} | ${
        item.scheduledSubject.section.name
      } | ${item.scheduledSubject.subject.name} | ${
        item.scheduledSubject.day
      } | ${formatTime(item.scheduledSubject.startTime)} - ${formatTime(
        item.scheduledSubject.endTime
      )} | ${item.scheduledSubject.room.name}`,
    });
    entityManagement.setIsDeleteDialogOpen(true);
  }

  async function handleSingleDelete() {
    if (!deleteData?.id) {
      toast.error(
        `Error deleting ${deleteData?.placeholder ?? "schedule"}: Invalid ID`
      );
      entityManagement.setIsDeleteDialogOpen(false);
      return;
    }

    entityManagement.setIsDeleting(true);
    try {
      const response = await fetch(
        `${SCHEDULED_INSTRUCTORS_API}/${deleteData.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 404) {
        throw new Error("Schedule not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error ?? "Response Error: Failed to delete schedule.";
        throw new Error(msg);
      }

      toast.success(
        `${deleteData.placeholder ?? "Schedule"} deleted successfully`
      );
      onChange();
      entityManagement.setIsDeleteDialogOpen(false);
      setDeleteData(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error(`Error deleting schedule:`, error);
    } finally {
      entityManagement.setIsDeleting(false);
      table.resetRowSelection();
    }
  }

  return (
    <>
      {entityManagement.isLoading ? (
        <DataTableSection>
          <DataTableSkeleton columnCount={4} rowCount={5} />
        </DataTableSection>
      ) : (
        <DataTableSection>
          <TableToolbar
            table={table}
            tableState={tableState}
            setTableState={setTableState}
            entityData={entityManagement.data}
            onRefresh={entityManagement.fetchData}
          />

          <TableComponent
            table={table}
            tableState={tableState}
            setTableState={setTableState}
          />

          <DeleteDialog
            isOpen={entityManagement.isDeleteDialogOpen}
            onClose={() => entityManagement.setIsDeleteDialogOpen(false)}
            itemName={deleteData?.placeholder}
            onConfirm={handleSingleDelete}
            isDeleting={entityManagement.isDeleting}
          />
        </DataTableSection>
      )}
    </>
  );
}
