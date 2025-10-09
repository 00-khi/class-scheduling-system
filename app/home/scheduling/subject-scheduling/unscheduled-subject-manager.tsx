"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  ROOMS_API,
  SCHEDULED_SUBJECTS_API,
  SECTIONS_API,
  SUBJECTS_API,
} from "@/lib/api/api-endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Separator } from "@/ui/shadcn/separator";
import { Day, Room, ScheduledSubject, Subject } from "@prisma/client";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { FormEvent, useEffect, useState } from "react";
import useTableColumns from "./hooks/unscheduled/use-table-columns";
import { useUnscheduledSubjectTable } from "./hooks/unscheduled/use-unscheduled-subject-table";
import {
  DataTableSection,
  DataTableSkeleton,
} from "@/ui/components/data-table-components";
import { TableToolbar } from "./components/unscheduled/table-toolbar";
import TableComponent from "./components/unscheduled/table-component";
import FormDialog from "./components/unscheduled/form-dialog";
import { toast } from "sonner";

export type UnscheduledSubjectRow = Subject & {
  scheduledSubject?: ScheduledSubject[];
  scheduledMinutes?: number;
  requiredMinutes?: number;
};

export type FormData = {
  sectionId?: number;
  roomId?: number;
  subjectId?: number;
  day?: Day;
  startTime?: string;
  endTime?: string;
} | null;

export type TableState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  pagination: PaginationState;
  globalFilter: string;
  selectedRowsCount: number;
};

const INITIAL_PAGINATION = { pageIndex: 0, pageSize: 10 };

export default function UnscheduledSubjectsManager({
  sectionId,
  onChange,
  refreshKey,
}: {
  sectionId: number;
  onChange: () => void;
  refreshKey: number;
}) {
  const [tableState, setTableState] = useState<TableState>({
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    pagination: INITIAL_PAGINATION,
    globalFilter: "",
    selectedRowsCount: 0,
  });

  const [formData, setFormData] = useState<FormData>(null);

  const subjectApi = createApiClient<Subject>(
    `${SECTIONS_API}/${sectionId}/subjects`
  );
  const roomApi = createApiClient<Room>(ROOMS_API);

  const entityManagement = useManageEntities<Subject>({
    apiService: { fetch: subjectApi.getAll },
    relatedApiServices: [{ key: "rooms", fetch: roomApi.getAll }],
  });

  useEffect(() => {
    entityManagement.fetchData();
  }, [sectionId, refreshKey]);

  const rooms = entityManagement.relatedData.rooms || [];

  const dayOptions = Object.values(Day).map((day) => ({
    value: day,
    label: day,
  }));

  const columns = useTableColumns();

  const table = useUnscheduledSubjectTable(
    entityManagement.data,
    columns,
    tableState,
    setTableState
  );

  function handleAdd() {
    setFormData((prev) => ({ ...prev, sectionId }));
    entityManagement.setIsFormDialogOpen(true);
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();

    if (!formData || !validateFormData(formData)) {
      return;
    }

    entityManagement.setIsSubmitting(true);

    try {
      const response = await fetch(SCHEDULED_SUBJECTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Response error");
      }

      toast.success("Schedule added");
      onChange();
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

  function validateFormData(data: FormData): boolean {
    if (!data) return false;

    const validations = [
      { field: data.sectionId, message: "Section is required" },
      { field: data.subjectId, message: "Subject is required" },
      { field: data.roomId, message: "Room is required" },
      { field: data.day, message: "Day is required" },
      { field: data.startTime, message: "Start Time is required" },
      { field: data.endTime, message: "End Time is required" },
    ];

    for (const { field, message } of validations) {
      if (!field) {
        toast.error(message);
        return false;
      }
    }

    return true;
  }

  // return (
  //   <Card className="gap-4">
  //     <CardHeader>
  //       <CardTitle className="text-card-foreground font-normal">
  //         Unscheduled Subjects
  //       </CardTitle>
  //     </CardHeader>
  //     <CardContent className="border-y py-4">
  //       {entityManagement.isLoading ? (
  //         <DataTableSection>
  //           <DataTableSkeleton columnCount={4} rowCount={5} />
  //         </DataTableSection>
  //       ) : (
  //         <DataTableSection>
  //           <TableToolbar
  //             table={table}
  //             tableState={tableState}
  //             setTableState={setTableState}
  //             entityData={entityManagement.data}
  //             onAdd={handleAdd}
  //             onRefresh={entityManagement.fetchData}
  //           />

  //           <TableComponent
  //             table={table}
  //             tableState={tableState}
  //             setTableState={setTableState}
  //           />

  //           <FormDialog
  //             sectionId={sectionId}
  //             subjects={entityManagement.data}
  //             rooms={rooms}
  //             dayOptions={dayOptions}
  //             isOpen={entityManagement.isFormDialogOpen}
  //             onClose={() => {
  //               entityManagement.setIsFormDialogOpen(false);
  //               setFormData(null);
  //             }}
  //             formData={formData}
  //             setFormData={setFormData}
  //             onSubmit={handleFormSubmit}
  //             isSubmitting={entityManagement.isSubmitting}
  //           />
  //         </DataTableSection>
  //       )}
  //     </CardContent>
  //   </Card>
  // );

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
            onAdd={handleAdd}
            onRefresh={entityManagement.fetchData}
          />

          <TableComponent
            table={table}
            tableState={tableState}
            setTableState={setTableState}
          />

          <FormDialog
            sectionId={sectionId}
            subjects={entityManagement.data}
            rooms={rooms}
            dayOptions={dayOptions}
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
        </DataTableSection>
      )}
    </>
  );
}
