"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import {
  AcademicLevel,
  Course,
  CourseSubject,
  CategoryType,
  Semester,
  Setting,
  Subject,
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
import DeleteDialog from "../../../../ui/components/table/delete-dialog";
import BulkDeleteDialog from "../../../../ui/components/table/bulk-delete-dialog";
import FailedDeleteDialog from "../../../../ui/components/table/failed-delete-dialog";
import { useSubjectTable } from "./hooks/use-subject-table";
import {
  ACADEMIC_LEVELS_API,
  COURSES_API,
  SETTINGS_API,
  SUBJECTS_API,
} from "@/lib/api/api-endpoints";

// types
export type SubjectRow = Subject & {
  academicLevel?: AcademicLevel;
  courseSubjects?: (CourseSubject & { course: Course })[];
};

export type FormData = {
  id?: number;
  code?: string;
  name?: string;
  semester?: Semester;
  type?: CategoryType;
  units?: number;
  hours?: number;
  academicLevelId?: number;
  courseSubjects?: { courseId?: number; year?: number }[];
  courseId?: number;
  year?: number;
  fieldOfSpecialization?: string;
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
export default function SubjectManager() {
  const [tableState, setTableState] = useState<TableState>({
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    pagination: INITIAL_PAGINATION,
    globalFilter: "",
    selectedRowsCount: 0,
  });

  const [formData, setFormData] = useState<FormData>(null);

  const subjectApi = createApiClient<Subject>(SUBJECTS_API);
  const academicLevelApi = createApiClient<AcademicLevel>(ACADEMIC_LEVELS_API);
  const courseApi = createApiClient<Course>(COURSES_API);
  const settingsApi = createApiClient<Setting>(SETTINGS_API);

  const entityManagement = useManageEntities<Subject>({
    apiService: { fetch: subjectApi.getAll },
    relatedApiServices: [
      { key: "academicLevels", fetch: academicLevelApi.getAll },
      { key: "courses", fetch: courseApi.getAll },
      // { key: "settings", fetch: settingsApi.getAll },
    ],
  });

  const academicLevels = entityManagement.relatedData.academicLevels || [];
  const courses = entityManagement.relatedData.courses || [];
  // const settings = entityManagement.relatedData.settings || [];

  // useEffect(() => {
  //   if (!settings.length) return;

  //   const defaultSemester =
  //     settings.find((s) => s.key === "semester")?.value ?? "";

  //   if (defaultSemester) {
  //     setTableState((prev) => ({
  //       ...prev,
  //       columnFilters: [
  //         ...prev.columnFilters.filter((f) => f.id !== "semester"),
  //         { id: "semester", value: defaultSemester },
  //       ],
  //     }));
  //   }
  // }, [settings]);

  const academicLevelOptions = academicLevels
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((al) => ({
      label: al.name,
      value: al.id,
    }));
  const semesterOptions = Object.values(Semester).map((sem) => ({
    value: sem,
    label: sem,
  }));
  const typeOptions = Object.values(CategoryType).map((type) => ({
    value: type,
    label: type,
  }));
  const courseOptions =
    formData?.academicLevelId !== null
      ? courses
          .filter(
            (course) => course.academicLevelId === formData?.academicLevelId
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((course) => ({
            label: course.name,
            value: course.id,
            valueType: "number",
          }))
      : [];
  // Build year options based on selected academic level
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

  const columns = useTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  const table = useSubjectTable(
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

  function handleEdit(item: SubjectRow) {
    setFormData({
      id: item.id,
      code: item.code,
      name: item.name,
      semester: item.semester,
      fieldOfSpecialization: item.fieldOfSpecialization,
      type: item.type,
      units: item.units,
      hours: item.hours,
      academicLevelId: item.academicLevelId,
      courseSubjects:
        item.courseSubjects?.map((cs) => ({
          courseId: cs.courseId,
          year: cs.year,
        })) ?? [],
    });

    entityManagement.setIsFormDialogOpen(true);
  }

  function handleDelete(item: SubjectRow) {
    setFormData({ id: item.id, name: item.name });
    entityManagement.setIsDeleteDialogOpen(true);
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();

    if (!formData || !validateFormData(formData)) {
      return;
    }

    const isUpdate = Boolean(formData.id);
    const url = isUpdate ? `${SUBJECTS_API}/${formData.id}` : SUBJECTS_API;

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

      toast.success(isUpdate ? "Subject updated" : "Subject added");
      entityManagement.fetchData();
      entityManagement.setIsFormDialogOpen(false);
      setFormData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error(message);
      console.error("Error saving subject:", err);
    } finally {
      entityManagement.setIsSubmitting(false);
      table.resetRowSelection();
    }
  }

  async function handleSingleDelete() {
    if (!formData?.id) {
      toast.error(`Error deleting ${formData?.name ?? "item"}: Invalid ID`);
      entityManagement.setIsDeleteDialogOpen(false);
      return;
    }

    entityManagement.setIsDeleting(true);
    try {
      const response = await fetch(`${SUBJECTS_API}/${formData.id}`, {
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
        fetch(`${SUBJECTS_API}/${id}`, { method: "DELETE" }).then(
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

      const successfulDeletions = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      const failedDeletions = results.filter(
        (r) => r.status === "rejected"
      ).length;

      if (successfulDeletions > 0) {
        toast.success(`${successfulDeletions} item(s) deleted successfully`);
      }

      if (failedDeletions > 0) {
        const failedReasons = results
          .filter((r) => r.status === "rejected")
          .map((r) => (r as PromiseRejectedResult).reason.message);

        entityManagement.setFailedReasons(failedReasons);
        entityManagement.setFailedCount(failedDeletions);
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

  function validateFormData(data: FormData): boolean {
    if (!data) return false;

    const validations = [
      { field: data.code, message: "Subject Code is required" },
      { field: data.name, message: "Subject Name is required" },
      { field: data.semester, message: "Semester is required" },
      { field: data.type, message: "Type is required" },
      { field: data.units, message: "Units is required", allowZero: true },
      { field: data.hours, message: "Hours is required", allowZero: true },
      {
        field: data.fieldOfSpecialization,
        message: "Field of Specialization is required",
      },
      { field: data.academicLevelId, message: "Academic Level is required" },
      { field: data.courseSubjects, message: "Course Subjects are required" },
    ];

    for (const { field, message, allowZero } of validations) {
      const isEmpty =
        field === null ||
        field === undefined ||
        (typeof field === "string" && field.trim() === "") ||
        (!allowZero && !field);

      if (isEmpty) {
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
            typeOptions={typeOptions}
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
