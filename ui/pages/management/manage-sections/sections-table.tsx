"use client";

import { DataTable } from "@/ui/components/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisIcon, PlusIcon, Loader2 } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";
import { IAcademicLevel, ICourse, ISection } from "@/types";
import {
  getSections,
  addSection,
  updateSection,
  deleteSection,
} from "@/services/sectionService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/shadcn/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";
import { getAcademicLevels } from "@/services/academicLevelService";
import { getCourses } from "@/services/courseService";

export default function SectionsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ISection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sections, setSections] = useState<ISection[]>([]);
  const [academicLevels, setAcademicLevels] = useState<IAcademicLevel[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);

  // 🆕 delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<ISection | null>(null);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setSections(getSections());
      setAcademicLevels(getAcademicLevels());
      setCourses(getCourses());
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD
  const handleAddSection = async (sectionData: Omit<ISection, "id">) => {
    setIsSubmitting(true);
    try {
      if (!sectionData.name) {
        toast.error("Section name is required");
        return;
      }

      if (!sectionData.academicLevelId) {
        toast.error("Academic level is required");
        return;
      }

      if (!sectionData.courseId) {
        toast.error("Course is required");
        return;
      }

      if (!sectionData.yearLevelId) {
        toast.error("Year level is required");
        return;
      }

      if (addSection(sectionData)) {
        toast.success(`Section added successfully`);
        loadData();
      } else {
        toast.error("Failed to add section");
      }
      setIsAddDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdateSection = async (sectionData: ISection) => {
    if (!sectionData.id) return;
    setIsSubmitting(true);
    try {
      if (!sectionData.name) {
        toast.error("Section name is required");
        return;
      }

      if (!sectionData.academicLevelId) {
        toast.error("Academic level is required");
        return;
      }

      if (!sectionData.courseId) {
        toast.error("Course is required");
        return;
      }

      if (!sectionData.yearLevelId) {
        toast.error("Year level is required");
        return;
      }

      const { id: id, ...data } = sectionData;

      if (updateSection(id, data)) {
        toast.success(`Section updated successfully`);
        loadData();
      } else {
        toast.error("Failed to update section");
      }

      setIsEditDialogOpen(false);
      setEditingSection(null);
    } catch (error) {
      toast.error("Error updating section");
      console.error("Error updating section:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteSection = (id: string) => {
    try {
      if (!id) {
        toast.error("Error deleting section: Invalid ID");
        return;
      }
      if (deleteSection(id)) {
        toast.success(`Section deleted successfully`);
        loadData();
      } else {
        toast.error("Failed to delete section");
      }
    } catch (error) {
      toast.error("Error deleting section");
      console.error("Error deleting section:", error);
    }
  };

  const getAcademicLevel = (academicLevelId: string) => {
    const acadLevel = academicLevels.find((al) => al.id === academicLevelId);

    return acadLevel
      ? { code: acadLevel.code, name: acadLevel.name }
      : { code: "Unknown", name: "Unknown" };
  };

  const getCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);

    return course
      ? { code: course.code, name: course.name }
      : { code: "Unknown", name: "Unknown" };
  };

  const getYearLevelByCourseId = (courseId: string, yearLevelId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { code: "Unknown", name: "Unknown" };

    const yearLevel = course.yearLevels?.find((yl) => yl.id === yearLevelId);
    return yearLevel
      ? { code: yearLevel.code, name: yearLevel.name }
      : { code: "Unknown", name: "Unknown" };
  };

  const columns: ColumnDef<ISection>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      header: "Academic Level",
      accessorKey: "academicLevelId",
      cell: ({ row }) => {
        const academicLevelId = row.getValue<string>("academicLevelId");
        const { code, name } = getAcademicLevel(academicLevelId);

        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">{code}</Badge>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      header: "Course",
      accessorKey: "courseId",
      cell: ({ row }) => {
        const courseId = row.getValue<string>("courseId");
        const { code, name } = getCourse(courseId);

        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">{code}</Badge>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      header: "Year Level",
      accessorKey: "yearLevelId",
      cell: ({ row }) => {
        const section = row.original;
        const { code, name } = getYearLevelByCourseId(
          section.courseId,
          section.yearLevelId
        );

        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">{code}</Badge>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          section={row.original}
          onEdit={(sec) => {
            setEditingSection(sec);
            setIsEditDialogOpen(true);
          }}
          onDelete={(sec) => {
            setSectionToDelete(sec);
            setIsDeleteDialogOpen(true);
          }}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading please wait...
          </span>
        </div>
      ) : (
        <DataTable
          data={sections}
          columns={columns}
          initialState={{
            columnFilters: [
              {
                id: "academicLevelId",
                value: "2",
              },
            ],
          }}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.Search
                column="name"
                placeholder="Search sections..."
                className="max-w-sm"
              />
              <DataTable.Filter
                column="academicLevelId"
                placeholder="All academic levels"
                renderValue={(id) => {
                  const acadLevel = academicLevels.find((a) => a.id === id);
                  return acadLevel ? acadLevel.name : "Unknown";
                }}
              />
              <DataTable.Filter
                column="courseId"
                placeholder="All courses"
                renderValue={(id) => {
                  const crs = courses.find((c) => c.id === id);
                  return crs ? crs.name : "Unknown";
                }}
              />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.DeleteSelected
                onDeleteSelected={(ids) => {
                  ids.forEach((id) => handleDeleteSection(id));
                }}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add Section
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      <SectionForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddSection}
        isLoading={isSubmitting}
        courses={courses}
        academicLevels={academicLevels}
      />

      <SectionForm
        item={editingSection || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingSection(null);
        }}
        onSubmit={handleUpdateSection}
        isLoading={isSubmitting}
        academicLevels={academicLevels}
        courses={courses}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (sectionToDelete?.id) {
            handleDeleteSection(sectionToDelete.id);
          }
          setIsDeleteDialogOpen(false);
          setSectionToDelete(null);
        }}
        itemName={sectionToDelete?.name}
      />
    </div>
  );
}

function RowActions({
  section,
  onEdit,
  onDelete,
}: {
  section: ISection;
  onEdit: (sec: ISection) => void;
  onDelete: (sec: ISection) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none">
            <EllipsisIcon size={16} />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(section)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(section)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SectionForm({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
  academicLevels,
  courses,
}: {
  isOpen: boolean;
  item?: ISection;
  onClose: () => void;
  onSubmit: (data: ISection) => void;
  isLoading?: boolean;
  academicLevels: IAcademicLevel[];
  courses: ICourse[];
}) {
  const [formData, setFormData] = useState<ISection>(
    item || ({} as Omit<ISection, "id">)
  );

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  const getYearLevelsByCourseId = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return [];

    const yearLevels = course.yearLevels;
    return yearLevels;
  };

  const getFilteredCourses = () => {
    if (!formData.academicLevelId) return [];
    return courses.filter(
      (c) => c.academicLevelId === formData.academicLevelId
    );
  };

  const resetForm = () => {
    setFormData(item || ({} as ISection));
  };

  const handleAcademicLevelChange = (value: string) => {
    setFormData({
      ...formData,
      academicLevelId: value,
      courseId: "",
      yearLevelId: "",
    });
  };

  const handleCourseChange = (value: string) => {
    setFormData({
      ...formData,
      courseId: value,
      yearLevelId: "",
    });
  };

  const handleChange = (value: string, item: string) => {
    setFormData?.((prev: any) => ({ ...prev, [item]: value }));
  };

  return (
    <DataForm<ISection>
      item={formData}
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={{ add: "Add Section", edit: "Edit Section" }}
    >
      <DataForm.Input
        name="name"
        label="Section Name"
        placeholder="e.g, BSIT101A"
        required
        onValueChange={(value: string) => handleChange(value, "name")}
      />

      {/* Academic Level */}
      <DataForm.Select
        name="academicLevelId"
        label="Academic Level"
        options={academicLevels.map((a) => ({ value: a.id, label: a.name }))}
        required
        onValueChange={handleAcademicLevelChange}
      />

      {/* Course */}
      <DataForm.Select
        name="courseId"
        label="Course"
        options={getFilteredCourses().map((c) => ({
          value: c.id as string,
          label: c.name,
        }))}
        required
        onValueChange={handleCourseChange}
        disabled={!formData.academicLevelId}
      />

      {/* Year Level */}
      <DataForm.Select
        name="yearLevelId"
        label="Year Level"
        options={getYearLevelsByCourseId(formData.courseId).map((yl) => ({
          value: yl.id!,
          label: yl.name,
        }))}
        disabled={!formData.courseId}
        onValueChange={(value: string) => handleChange(value, "yearLevelId")}
        required
      />
    </DataForm>
  );
}
