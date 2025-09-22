"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import { ROOMS_API, SECTIONS_API, SUBJECTS_API } from "@/lib/api/api-endpoints";
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

export type UnscheduledSubjectRow = Subject & {
  scheduledSubject?: ScheduledSubject[];
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
}: {
  sectionId: number;
}) {
  useEffect(() => {
    entityManagement.fetchData();
  }, [sectionId]);

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

  const rooms = entityManagement.relatedData.rooms || [];

  const subjectOptions = entityManagement.data.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const roomOptions = rooms.map((r) => ({
    label: r.name,
    value: r.id,
  }));

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
    setFormData(null);
    entityManagement.setIsFormDialogOpen(true);
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-card-foreground font-normal">
          Unscheduled Subjects
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
              subjectOptions={subjectOptions}
              roomOptions={roomOptions}
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
      </CardContent>
    </Card>
  );
}
