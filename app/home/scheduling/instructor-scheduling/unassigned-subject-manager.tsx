"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  INSTRUCTORS_API,
  UNASSIGNED_SCHEDULED_SUBJECTS_API,
} from "@/lib/api/api-endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import {
  Instructor,
  Room,
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
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import useTableColumns from "./hooks/unassigned/use-table-columns";
import { useUnassignedSubjectTable } from "./hooks/unassigned/use-unassigned-subject-table";
import {
  DataTableSection,
  DataTableSkeleton,
} from "@/ui/components/data-table-components";
import { TableToolbar } from "./components/assigned/table-toolbar";
import TableComponent from "./components/assigned/table-component";
import FormDialog from "./components/assigned/form-dialog";
import { Badge } from "@/ui/shadcn/badge";
import { Separator } from "@/ui/shadcn/separator";

export type UnassignedSubjectRow = ScheduledSubject & {
  subject?: Subject;
  room?: Room;
  section?: Section;
};

export type FormData = {
  isntructorId?: number;
  scheduledSubjectId?: number;
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

export default function UnassignedSubjectManager({
  onChange,
  refreshKey,
}: {
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

  const unassignedSubjectApi = createApiClient<ScheduledSubject>(
    UNASSIGNED_SCHEDULED_SUBJECTS_API
  );
  const instructorApi = createApiClient<Instructor>(INSTRUCTORS_API);

  const entityManagement = useManageEntities<ScheduledSubject>({
    apiService: { fetch: unassignedSubjectApi.getAll },
    relatedApiServices: [{ key: "instructors", fetch: instructorApi.getAll }],
  });

  useEffect(() => {
    entityManagement.fetchData();
  }, [refreshKey]);

  const instructors: Instructor[] =
    entityManagement.relatedData.instructors || [];

  const instructorOptions = instructors.map((instructor) => ({
    value: instructor.id,
    label: instructor.name,
  }));

  const columns = useTableColumns({ onEdit: handleEdit });

  const table = useUnassignedSubjectTable(
    entityManagement.data,
    columns,
    tableState,
    setTableState
  );

  function handleEdit(item: UnassignedSubjectRow) {
    setFormData({
      scheduledSubjectId: item.subjectId,
    });

    entityManagement.setIsFormDialogOpen(true);
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();

    if (!formData || !validateFormData(formData)) {
      return;
    }

    entityManagement.setIsSubmitting(true);

    try {
      const response = await fetch(UNASSIGNED_SCHEDULED_SUBJECTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Response error");
      }

      toast.success("Schedule assigned");
      onChange();
      entityManagement.setIsFormDialogOpen(false);
      setFormData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error(message);
      console.error("Error saving:", err);
    } finally {
      entityManagement.setIsSubmitting(false);
      table.resetRowSelection();
    }
  }

  function validateFormData(data: FormData): boolean {
    if (!data) return false;

    const validations = [
      {
        field: data.scheduledSubjectId,
        message: "Scheduled Subject is required",
      },
      { field: data.isntructorId, message: "Instructor is required" },
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
  //         Unassigned Subjects
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
  //             onRefresh={entityManagement.fetchData}
  //           />

  //           <TableComponent
  //             table={table}
  //             tableState={tableState}
  //             setTableState={setTableState}
  //           />

  //           <FormDialog
  //             unassignedSubjects={entityManagement.data}
  //             instructorOptions={instructorOptions}
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
            onRefresh={entityManagement.fetchData}
          />

          <TableComponent
            table={table}
            tableState={tableState}
            setTableState={setTableState}
          />

          <FormDialog
            unassignedSubjects={entityManagement.data}
            instructorOptions={instructorOptions}
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
