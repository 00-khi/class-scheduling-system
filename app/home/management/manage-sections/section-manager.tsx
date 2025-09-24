"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import {
  AcademicLevel,
  AcademicQualification,
  Course,
  Section,
  Semester,
  Setting,
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

import { TableToolbar } from "./components/table-toolbar";
import TableComponent from "./components/table-component";
import FormDialog from "./components/form-dialog";
import DeleteDialog from "../../../../ui/components/table/delete-dialog";
import BulkDeleteDialog from "../../../../ui/components/table/bulk-delete-dialog";
import FailedDeleteDialog from "../../../../ui/components/table/failed-delete-dialog";
import { useSectionTable } from "./hooks/use-section-table";
import {
  ACADEMIC_LEVELS_API,
  ACADEMIC_QUALIFICATIONS_API,
  COURSES_API,
  SECTIONS_API,
  SETTINGS_API,
} from "@/lib/api/api-endpoints";
import useTableColumns from "./hooks/use-table-columns";

// types
export type SectionRow = Section & {
  course?: Course & { academicLevel?: AcademicLevel };
};

export type FormData = {
  semester?: Semester;
  academicLevelId?: number;
  courseId?: number;
  year?: number;
  totalSections?: number;
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
export default function SectionManager() {
  const [tableState, setTableState] = useState<TableState>({
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    pagination: INITIAL_PAGINATION,
    globalFilter: "",
    selectedRowsCount: 0,
  });

  const [formData, setFormData] = useState<FormData>(null);

  const sectionApi = createApiClient<Section>(SECTIONS_API);
  const academicLevelApi = createApiClient<AcademicLevel>(ACADEMIC_LEVELS_API);
  const courseApi = createApiClient<Course>(COURSES_API);
  const settingsApi = createApiClient<Setting>(SETTINGS_API);
  const entityManagement = useManageEntities<Section>({
    apiService: { fetch: sectionApi.getAll },
    relatedApiServices: [
      { key: "academicLevels", fetch: academicLevelApi.getAll },
      { key: "courses", fetch: courseApi.getAll },
      { key: "settings", fetch: settingsApi.getAll },
    ],
  });

  const academicLevels = entityManagement.relatedData.academicLevels || [];
  const courses = entityManagement.relatedData.courses || [];
  const settings = entityManagement.relatedData.settings || [];

  useEffect(() => {
    if (!settings.length) return;

    const defaultSemester =
      settings.find((s) => s.key === "semester")?.value ?? "";

    if (defaultSemester) {
      setTableState((prev) => ({
        ...prev,
        columnFilters: [
          ...prev.columnFilters.filter((f) => f.id !== "semester"),
          { id: "semester", value: defaultSemester },
        ],
      }));
    }
  }, [settings]);

  const academicLevelOptions = academicLevels.map((al) => ({
    label: al.name,
    value: al.id,
  }));
  const semesterOptions = Object.values(Semester).map((sem) => ({
    value: sem,
    label: sem,
  }));
  const courseOptions =
    formData?.academicLevelId !== null
      ? courses
          .filter(
            (course) => course.academicLevelId === formData?.academicLevelId
          )
          .map((course) => ({
            label: course.name,
            value: course.id,
            valueType: "number",
          }))
      : [];
  const yearOptions =
    formData?.academicLevelId !== null
      ? (
          academicLevels.find((level) => level.id === formData?.academicLevelId)
            ?.yearList || []
        ).map((year: number) => ({
          label: year,
          value: year,
          valueType: "number",
        }))
      : [];

  const columns = useTableColumns();

  const table = useSectionTable(
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

    if (!formData || !validateFormData(formData)) {
      return;
    }

    entityManagement.setIsSubmitting(true);

    try {
      const response = await fetch(SECTIONS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Response error");
      }

      toast.success("Section saved");
      entityManagement.fetchData();
      entityManagement.setIsFormDialogOpen(false);
      setFormData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error(message);
      console.error("Error saving section:", err);
    } finally {
      entityManagement.setIsSubmitting(false);
      table.resetRowSelection();
    }
  }

  function validateFormData(data: FormData): boolean {
    if (!data) return false;

    const validations = [
      { field: data.semester, message: "Semester is required" },
      { field: data.academicLevelId, message: "Academic level is required" },
      { field: data.courseId, message: "Course is required" },
      { field: data.year, message: "Year is required" },
      { field: data.totalSections, message: "Total sections is required" },
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
          test
          <TableToolbar
            table={table}
            tableState={tableState}
            setTableState={setTableState}
            entityData={entityManagement.data}
            selectedRowsCount={tableState.selectedRowsCount}
            onAdd={handleAdd}
            onBulkDelete={() =>
              entityManagement.setIsDeleteSelectedDialogOpen(true)
            }
            entityManagement={entityManagement}
          />
          <TableComponent
            table={table}
            tableState={tableState}
            setTableState={setTableState}
          />
          <FormDialog
            semesterOptions={semesterOptions}
            courseOptions={courseOptions}
            yearOptions={yearOptions}
            academicLevelOptions={academicLevelOptions}
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
    </DataTableSection>
  );
}
