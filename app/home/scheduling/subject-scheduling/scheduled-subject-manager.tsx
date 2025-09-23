"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import { SCHEDULED_SUBJECTS_API, SECTIONS_API } from "@/lib/api/api-endpoints";
import {
  DataTableSection,
  DataTableSkeleton,
} from "@/ui/components/data-table-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Room, ScheduledSubject, Subject } from "@prisma/client";
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import useTableColumns from "./hooks/scheduled/use-table-columns";
import { useScheduledSubjectTable } from "./hooks/scheduled/use-scheduled-subject-table";
import { TableToolbar } from "./components/scheduled/table-toolbar";
import TableComponent from "./components/scheduled/table-component";
import DeleteDialog from "@/ui/components/table/delete-dialog";
import { toast } from "sonner";
import { formatTime } from "@/lib/schedule-utils";

export type ScheduledSubjectRow = ScheduledSubject & {
  room: Room;
  subject: Subject;
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

export default function ScheduledSubjectManager({
  sectionId,
  onChange,
  refreshKey,
}: {
  sectionId: number;
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

  const subjectApi = createApiClient<ScheduledSubjectRow>(
    `${SECTIONS_API}/${sectionId}/schedules`
  );

  const entityManagement = useManageEntities<ScheduledSubjectRow>({
    apiService: { fetch: subjectApi.getAll },
  });

  useEffect(() => {
    entityManagement.fetchData();
  }, [sectionId, refreshKey]);

  const columns = useTableColumns({ onDelete: handleDelete });

  const table = useScheduledSubjectTable(
    entityManagement.data,
    columns,
    tableState,
    setTableState
  );

  function handleDelete(item: ScheduledSubjectRow) {
    setDeleteData({
      id: item.id,
      placeholder: `${item.subject.name} | ${item.day} | ${formatTime(
        item.startTime
      )} - ${formatTime(item.endTime)} | ${item.room.name}`,
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
        `${SCHEDULED_SUBJECTS_API}/${deleteData.id}`,
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
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-card-foreground font-normal">
          Scheduled Subjects
        </CardTitle>
      </CardHeader>
      <CardContent className="border-y py-4 space">
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
      </CardContent>
    </Card>
  );
}
