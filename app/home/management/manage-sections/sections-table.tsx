"use client";

import { useManageEntities } from "@/hooks/use-manage-entities";
import { createApiClient } from "@/lib/api/api-client";
import {
  handleAddEntity,
  handleDeleteSelectedEntities,
} from "@/lib/crud-handler";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { DataTable } from "@/ui/components/data-table";
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
import { AcademicLevel, Course, Section, Semester } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SectionsTable() {
  const ENTITY_NAME = "Section";

  const sectionApi = createApiClient<Section>("/api/sections");
  const academicLevelApi = createApiClient<AcademicLevel>(
    "/api/academic-levels"
  );
  const courseApi = createApiClient<Course>("/api/courses");

  const entityManagement = useManageEntities<Section>({
    apiService: { fetch: sectionApi.getAll },
    relatedApiServices: [
      { key: "academicLevels", fetch: academicLevelApi.getAll },
      { key: "courses", fetch: courseApi.getAll },
    ],
  });

  const academicLevels = entityManagement.relatedData.academicLevels || [];
  const courses = entityManagement.relatedData.courses || [];

  const validateSection = (
    data: Partial<Section & { totalSections: number; academicLevelId: number }>,
    requireId = false
  ): boolean => {
    if (requireId && !data.id) {
      toast.error("Invalid ID");
      return false;
    }

    if (
      !data.semester ||
      !data.academicLevelId ||
      !data.courseId ||
      !data.year
    ) {
      toast.error("All fields are required.");
      return false;
    }

    if (data.totalSections !== undefined && data.totalSections < 0) {
      toast.error("Total sections must not be negative.");
      return false;
    }

    return true;
  };

  type SectionRow = Section & {
    course?: Course & { academicLevel: AcademicLevel };
  };

  const columns: ColumnDef<SectionRow>[] = [
    {
      header: "Academic Level",
      id: "academicLevel",
      accessorFn: (row) => row.course?.academicLevel?.name || "N/A",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">
                {row.original.course?.academicLevel?.code || "N/A"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.course?.academicLevel?.name || "N/A"}
            </TooltipContent>
          </Tooltip>
        );
      },
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
      header: "Course",
      id: "course",
      accessorFn: (row) => row.course?.name || "N/A",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">
                {row.original.course?.code || "N/A"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.course?.name || "N/A"}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      header: "Year",
      accessorKey: "year",
      accessorFn: (row) => String(row.year ?? ""),
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.original.year || "N/A"}</Badge>;
      },
      filterFn: "equals",
    },
  ];

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

    setFormData({
      ...formData,
      academicLevelId: parsedId,
    });

    setSelectedAcademicLevelId(parsedId);
  };

  // Map related data to options for the forms
  const semesterOptions = Object.values(Semester).map((sem) => ({
    value: sem,
    label: sem,
  }));
  const academicLevelOptions = academicLevels.map((level) => ({
    label: level.name,
    value: level.id,
  }));
  const courseOptions = courses
    .filter(
      (course) =>
        selectedAcademicLevelId === null ||
        course.academicLevelId === selectedAcademicLevelId
    )
    .map((course) => ({
      label: course.name,
      value: course.id,
      valueType: "number",
    }));
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

  const [formData, setFormData] = useState<
    Partial<Section & { academicLevelId: number }>
  >({});

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
                placeholder="Search sections..."
                className="max-w-sm"
              />
              <DataTable.Filter
                column="academicLevel"
                placeholder="All academic levels"
              />
              <DataTable.Filter column="course" placeholder="All courses" />
              <DataTable.Filter column="year" placeholder="All years" />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </DataTableToolbarGroup>
            <DataTableToolbarGroup>
              <Button onClick={() => entityManagement.setIsAddDialogOpen(true)}>
                <EditIcon className="-ms-1 opacity-60" size={16} />
                Add / Remove {ENTITY_NAME}
              </Button>
            </DataTableToolbarGroup>
          </DataTableToolbar>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      {/* Add Form */}
      <EntityForm<Section>
        item={formData as Section}
        isOpen={entityManagement.isAddDialogOpen}
        onClose={() => {
          setFormData({});
          entityManagement.setIsAddDialogOpen(false);
          setSelectedAcademicLevelId(null);
        }}
        onSubmit={(data) => {
          return handleAddEntity(
            ENTITY_NAME,
            data,
            sectionApi.add,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            entityManagement.setIsAddDialogOpen,
            validateSection
          );
        }}
        isLoading={entityManagement.isSubmitting}
        title={`Manage ${ENTITY_NAME}`}
      >
        <DataForm.Select
          onValueChange={(data) => {
            setFormData({
              ...formData,
              semester: data as Semester,
            });
          }}
          name="semester"
          label="Semester"
          options={semesterOptions}
        />
        <DataForm.Select
          name="academicLevelId"
          label="Academic Level"
          placeholder="Select academic level"
          options={academicLevelOptions}
          onValueChange={handleSelectedAcademicLevel}
        />
        <DataForm.Select
          name="courseId"
          label="Course"
          placeholder="Select course"
          options={courseOptions}
        />
        <DataForm.Select
          name="year"
          label="Year"
          placeholder="Select year"
          options={yearOptions}
        />
        <DataForm.Input
          name="totalSections"
          label="Total Sections"
          type="number"
          placeholder="e.g., 4"
        />
      </EntityForm>
    </DataTableSection>
  );
}
