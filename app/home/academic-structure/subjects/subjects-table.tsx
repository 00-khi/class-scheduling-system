"use client";

import {
  handleAddEntity,
  handleDeleteEntity,
  handleDeleteSelectedEntities,
  handleUpdateEntity,
} from "@/lib/crud-handler";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { DataTable } from "@/ui/components/data-table";
import {
  getActionsColumn,
  getSelectColumn,
} from "@/ui/components/data-table-columns";
import {
  DataTableSection,
  DataTableSkeleton,
  DataTableToolbar,
  DataTableToolbarGroup,
} from "@/ui/components/data-table-components";
import { EntityForm } from "@/ui/components/entity-form";
import { FailedDeletionDialog } from "@/ui/components/failed-deletion-dialog";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";
import {
  AcademicLevel,
  Course,
  RoomType,
  Semester,
  Subject,
  CourseSubject,
} from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useManageEntities } from "@/hooks/use-manage-entities";
import { createApiClient } from "@/lib/api/api-client";
import React, { useEffect, useState } from "react";

export default function SubjectsTable() {
  const ENTITY_NAME = "Subject";

  const subjectApi = createApiClient<Subject>("/api/subjects");
  const academicLevelApi = createApiClient<AcademicLevel>(
    "/api/academic-levels"
  );
  const courseApi = createApiClient<Course>("/api/courses");

  const entityManagement = useManageEntities<Subject>({
    apiService: { fetch: subjectApi.getAll },
    relatedApiServices: [
      { key: "academicLevels", fetch: academicLevelApi.getAll },
      { key: "courses", fetch: courseApi.getAll },
    ],
  });

  const academicLevels = entityManagement.relatedData.academicLevels || [];
  const courses = entityManagement.relatedData.courses || [];

  const validateSubject = (
    data: Partial<Subject>,
    requireId = false
  ): boolean => {
    if (requireId && !data.id) {
      toast.error("Invalid ID");
      return false;
    }

    if (
      !data.name ||
      !data.code ||
      !data.units ||
      !data.type ||
      !data.semester ||
      !data.academicLevelId
    ) {
      toast.error("All fields are required.");
      return false;
    }

    if (typeof data.units !== "number" || data.units <= 0) {
      toast.error("Units must be a positive number.");
      return false;
    }

    return true;
  };

  type SubjectRow = Subject & {
    academicLevel?: AcademicLevel;
    courseSubjects?: (CourseSubject & { course: Course })[];
  };

  const columns: ColumnDef<SubjectRow>[] = [
    getSelectColumn<SubjectRow>(),
    {
      header: "Code",
      accessorKey: "code",
      enableHiding: false,
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      enableHiding: false,
    },
    {
      header: "Units",
      accessorKey: "units",
      meta: {
        filterVariant: "range",
      },
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("type")}</Badge>
      ),
    },
    {
      header: "Academic Level",
      id: "academicLevel",
      accessorFn: (row) => row.academicLevel?.name || "N/A",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">
                {row.original.academicLevel?.code || "N/A"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.academicLevel?.name || "N/A"}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      header: "Courses",
      id: "courses",
      accessorFn: (row) =>
        row.courseSubjects?.map((c) => c.course.name).join(", ") || "N/A",
      cell: ({ row }) => {
        const courseData =
          row.original.courseSubjects?.map(({ course, year }) => ({
            name: course.name,
            code: course.code,
            year: year,
          })) || [];

        return (
          <div className="flex flex-wrap gap-1">
            {courseData.length > 0 ? (
              courseData.map((course, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger>
                    <Badge variant="outline">
                      {course.code} - {course.year}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {course.name} - {course.year}
                  </TooltipContent>
                </Tooltip>
              ))
            ) : (
              <Badge variant="outline">N/A</Badge>
            )}
          </div>
        );
      },
    },
    getActionsColumn<SubjectRow>({
      onEdit: (item) => {
        entityManagement.setEditingItem(item);
        entityManagement.setIsEditDialogOpen(true);
      },
      onDelete: (item) => {
        entityManagement.setItemToDelete(item);
        entityManagement.setIsDeleteDialogOpen(true);
      },
    }),
  ];

  // when an item is loaded for editing, set selected academic level immediately
  useEffect(() => {
    const editing = entityManagement.editingItem;
    if (editing && editing.academicLevelId) {
      setSelectedAcademicLevelId(editing.academicLevelId);
    } else {
      setSelectedAcademicLevelId(null);
    }
  }, [entityManagement.editingItem]);

  const [selectedAcademicLevelId, setSelectedAcademicLevelId] = useState<
    number | null
  >(null);

  const handleSelectedAcademicLevel = (id: any) => {
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
      toast.error("Invalid ID");
      setSelectedAcademicLevelId(null);
      return;
    }
    const level = academicLevels.find((l) => l.id === id);
    const validYears = new Set(level?.yearList ?? []);

    setSelectedAcademicLevelId(parsedId);

    console.log(parsedId);
  };

  // Map related data to options for the forms
  const academicLevelOptions = academicLevels.map((level) => ({
    label: level.name,
    value: level.id,
  }));
  const semesterOptions = Object.values(Semester).map((sem) => ({
    value: sem,
    label: sem,
  }));
  const typeOptions = Object.values(RoomType).map((type) => ({
    value: type,
    label: type,
  }));
  const courseOptions: {
    label: string;
    value: string;
    valueType: "string" | "number";
  }[] =
    selectedAcademicLevelId !== null
      ? courses
          .filter(
            (course) => course.academicLevelId === selectedAcademicLevelId
          )
          .map((course) => ({
            label: course.name,
            value: course.id,
            valueType: "number",
          }))
      : [];
  // Build year options based on selected academic level
  const yearOptions: typeof courseOptions =
    selectedAcademicLevelId !== null
      ? (
          academicLevels.find((level) => level.id === selectedAcademicLevelId)
            ?.yearList || []
        ).map((year: number) => ({
          label: year,
          value: year,
          valueType: "number",
        }))
      : [];

  // compute allowed value arrays
  const allowedCourseIds = courseOptions.map((c) => c.value);
  const allowedYears = yearOptions.map((y) => y.value);

  return (
    <DataTableSection>
      {entityManagement.loading ? (
        <DataTableSkeleton columnCount={6} rowCount={5} />
      ) : (
        <DataTable data={entityManagement.data} columns={columns}>
          <DataTableToolbar>
            <DataTableToolbarGroup>
              <DataTable.Search
                column="name"
                placeholder="Search subjects..."
                className="max-w-sm"
              />
              <DataTable.Filter column="type" placeholder="All types" />
              <DataTable.Filter
                column="academicLevel"
                placeholder="All academic levels"
              />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </DataTableToolbarGroup>
            <DataTableToolbarGroup>
              <DataTable.DeleteSelected
                onDeleteSelected={(ids) => {
                  return handleDeleteSelectedEntities(
                    ENTITY_NAME,
                    ids,
                    subjectApi.delete,
                    entityManagement.fetchData,
                    entityManagement.setIsDeletingSelected,
                    entityManagement.setFailedReasons,
                    entityManagement.setFailedCount,
                    entityManagement.setFailedDialogOpen
                  );
                }}
                isDeletingSelected={entityManagement.isDeletingSelected}
              />
              <Button onClick={() => entityManagement.setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add {ENTITY_NAME}
              </Button>
            </DataTableToolbarGroup>
          </DataTableToolbar>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      {/* Add Form */}
      <EntityForm<Subject>
        isOpen={entityManagement.isAddDialogOpen}
        onClose={() => {
          entityManagement.setIsAddDialogOpen(false);
          setSelectedAcademicLevelId(null);
        }}
        onSubmit={(data) => {
          return handleAddEntity(
            ENTITY_NAME,
            data,
            subjectApi.add,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            entityManagement.setIsAddDialogOpen,
            validateSubject
          );
        }}
        isLoading={entityManagement.isSubmitting}
        title={`Add ${ENTITY_NAME}`}
      >
        <DataForm.Input name="code" label="Code" placeholder="e.g., MATH101" />
        <DataForm.Input
          name="name"
          label="Name"
          placeholder="e.g., General Mathematics"
        />
        <DataForm.Select
          name="semester"
          label="Semester"
          options={semesterOptions}
        />
        <DataForm.Select name="type" label="Type" options={typeOptions} />
        <DataForm.Input
          name="units"
          label="Units"
          type="number"
          placeholder="e.g., 3"
        />
        <DataForm.Select
          name="academicLevelId"
          label="Academic Level"
          placeholder="Select academic level"
          options={academicLevelOptions}
          onValueChange={handleSelectedAcademicLevel}
        />

        <DataForm.ArrayField
          name="courseSubjects"
          label="Courses"
          validValuesByField={{
            courseId: allowedCourseIds,
            year: allowedYears,
          }}
          fields={[
            {
              name: "courseId",
              placeholder: "Select course",
              options: courseOptions,
            },
            {
              name: "year",
              placeholder: "Select year",
              options: yearOptions,
            },
          ]}
        />
      </EntityForm>

      {/* Edit Form */}
      <EntityForm<Subject>
        item={entityManagement.editingItem || undefined}
        isOpen={entityManagement.isEditDialogOpen}
        onClose={() => {
          entityManagement.setIsEditDialogOpen(false);
          entityManagement.setEditingItem(null);
          setSelectedAcademicLevelId(null);
        }}
        onSubmit={(data) => {
          return handleUpdateEntity(
            ENTITY_NAME,
            data,
            subjectApi.update,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            () => {
              entityManagement.setIsEditDialogOpen(false);
              entityManagement.setEditingItem(null);
            },
            validateSubject
          );
        }}
        isLoading={entityManagement.isSubmitting}
        title={`Edit ${ENTITY_NAME}`}
      >
        <DataForm.Input name="code" label="Code" placeholder="e.g., MATH101" />
        <DataForm.Input
          name="name"
          label="Name"
          placeholder="e.g., General Mathematics"
        />
        <DataForm.Select
          name="semester"
          label="Semester"
          options={semesterOptions}
        />
        <DataForm.Select name="type" label="Type" options={typeOptions} />
        <DataForm.Input
          name="units"
          label="Units"
          type="number"
          placeholder="e.g., 3"
        />
        <DataForm.Select
          name="academicLevelId"
          label="Academic Level"
          placeholder="Select academic level"
          options={academicLevelOptions}
          onValueChange={handleSelectedAcademicLevel}
        />

        <DataForm.ArrayField
          name="courseSubjects"
          label="Courses"
          validValuesByField={{
            courseId: allowedCourseIds,
            year: allowedYears,
          }}
          fields={[
            {
              name: "courseId",
              placeholder: "Select course",
              options: courseOptions,
            },
            {
              name: "year",
              placeholder: "Select year",
              options: yearOptions,
            },
          ]}
        />
      </EntityForm>

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={entityManagement.isDeleteDialogOpen}
        onClose={() => entityManagement.setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (entityManagement.itemToDelete?.id) {
            return handleDeleteEntity(
              ENTITY_NAME,
              entityManagement.itemToDelete.id,
              subjectApi.delete,
              entityManagement.fetchData,
              entityManagement.setIsDeleting,
              () => {
                entityManagement.setItemToDelete(null);
                entityManagement.setIsDeleteDialogOpen(false);
              }
            );
          }
        }}
        itemName={entityManagement.itemToDelete?.name}
        isDeleting={entityManagement.isDeleting}
      />

      <FailedDeletionDialog
        open={entityManagement.failedDialogOpen}
        onClose={() => entityManagement.setFailedDialogOpen(false)}
        failedCount={entityManagement.failedCount}
        failedReasons={entityManagement.failedReasons}
      />
    </DataTableSection>
  );
}
function useFormContext(): { control: any } {
  throw new Error("Function not implemented.");
}

function useWatch(arg0: { control: any; name: string }) {
  throw new Error("Function not implemented.");
}
