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
import { IAcademicLevel, ICourse } from "@/types";
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "@/services/courseService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/shadcn/components/ui/badge";
import { getAcademicLevels } from "@/services/academicLevelService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";

export default function CoursesTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ICourse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [academicLevels, setAcademicLevels] = useState<IAcademicLevel[]>([]);

  // 🆕 delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<ICourse | null>(null);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setCourses(getCourses());
      setAcademicLevels(getAcademicLevels());
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD
  const handleAddCourse = async (courseData: Omit<ICourse, "_id">) => {
    setIsSubmitting(true);
    try {
      if (!courseData.code) {
        toast.error("Course code is required");
      }

      if (!courseData.name) {
        toast.error("Course name is required");
        return;
      }

      if (!courseData.academicLevelId) {
        toast.error("Academic level is required");
        return;
      }

      if (addCourse(courseData)) {
        toast.success(`Course added successfully`);
        loadData();
      } else {
        toast.error("Failed to add course");
      }
      setIsAddDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdateCourse = async (courseData: ICourse) => {
    if (!courseData._id) return;
    setIsSubmitting(true);
    try {
      if (!courseData.code) {
        toast.error("Course code is required");
      }

      if (!courseData.name) {
        toast.error("Course name is required");
        return;
      }

      if (!courseData.academicLevelId) {
        toast.error("Academic level is required");
        return;
      }

      const {_id, ...data } = courseData;

      if (
        updateCourse(_id, data)
      ) {
        toast.success(`Course updated successfully`);
        loadData();
      } else {
        toast.error("Failed to update course");
      }

      setIsEditDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
      toast.error("Error updating course");
      console.error("Error updating course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteCourse = (id: string) => {
    try {
      if (!id) {
        toast.error("Error deleting course: Invalid ID");
        return;
      }
      if (deleteCourse(id)) {
        toast.success(`Course deleted successfully`);
        loadData();
      } else {
        toast.error("Failed to delete course");
      }
    } catch (error) {
      toast.error("Error deleting course");
      console.error("Error deleting course:", error);
    }
  };

  const getAcademicLevelName = (academicLevelId: string) => {
    const acadQual = academicLevels.find((d) => d._id === academicLevelId);
    return acadQual ? acadQual.name : "Unknown";
  };

  const getAcademicLevelCode = (academicLevelId: string) => {
    const acadLevel = academicLevels.find((d) => d._id === academicLevelId);
    return acadLevel ? acadLevel.code : "Unknown";
  };

  const getYearLevelCode = (course: ICourse, yearLevelId: string) => {
    const yearLevel = (course.yearLevels || []).find(
      (yl) => yl._id === yearLevelId
    );
    return yearLevel ? yearLevel.code : "Unknown";
  };
  
  const columns: ColumnDef<ICourse>[] = [
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
      id: "code",
      header: "Code",
      accessorKey: "code",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("code")}</Badge>
      ),
    },
    {
      id: "name",
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

        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">
                {getAcademicLevelCode(academicLevelId)}
              </Badge>
              {/* <AcademicLevelCodeBadge academicLevelId={academicLevelId} /> */}
            </TooltipTrigger>
            <TooltipContent>
              {getAcademicLevelName(academicLevelId)}
            </TooltipContent>
          </Tooltip>
        );
        // return <AcademicLevelCodeBadge academicLevelId={academicLevelId} />;
      },
    },
    {
      id: "yearLevels",
      header: "Year Levels",
      accessorKey: "yearLevels",
      cell: ({ row }) => {
        const course = row.original as ICourse;
        const levels = course.yearLevels || [];

        return (
          <div className="flex flex-wrap gap-1">
            {levels.length > 0 ? (
              levels.map((yl) =>
                yl._id ? (
                  <Tooltip key={yl._id}>
                    <TooltipTrigger>
                      <Badge variant="secondary">
                        {getYearLevelCode(course, yl._id)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{yl.name}</TooltipContent>
                  </Tooltip>
                ) : null
              )
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          course={row.original}
          onEdit={(c) => {
            setEditingCourse(c);
            setIsEditDialogOpen(true);
          }}
          onDelete={(c) => {
            setCourseToDelete(c);
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
        <DataTable data={courses} columns={columns}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.Search
                column="name"
                placeholder="Search courses..."
                className="max-w-sm"
              />
              <DataTable.Filter
                column="academicLevelId"
                placeholder="All academic levels"
                renderValue={(id) => {
                  const acadLevel = academicLevels.find((a) => a._id === id);
                  return acadLevel ? acadLevel.name : "Unknown";
                }}
              />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.DeleteSelected
                onDeleteSelected={(ids) => {
                  ids.forEach((id) => handleDeleteCourse(id));
                }}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add Course
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      <CourseForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddCourse}
        isLoading={isSubmitting}
        academicLevels={academicLevels}
      />

      <CourseForm
        item={editingCourse || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleUpdateCourse}
        isLoading={isSubmitting}
        academicLevels={academicLevels}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (courseToDelete?._id) {
            handleDeleteCourse(courseToDelete._id);
          }
          setIsDeleteDialogOpen(false);
          setCourseToDelete(null);
        }}
        itemName={courseToDelete?.name}
      />
    </div>
  );
}

function RowActions({
  course,
  onEdit,
  onDelete,
}: {
  course: ICourse;
  onEdit: (c: ICourse) => void;
  onDelete: (c: ICourse) => void;
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
        <DropdownMenuItem onClick={() => onEdit(course)}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(course)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CourseForm({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
  academicLevels,
}: {
  isOpen: boolean;
  item?: ICourse;
  onClose: () => void;
  onSubmit: (data: ICourse) => void;
  isLoading?: boolean;
  academicLevels?: IAcademicLevel[];
}) {
  return (
    <DataForm<ICourse>
      item={item}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={{ add: "Add Course", edit: "Edit Course" }}
    >
      <DataForm.Input
        name="code"
        label="Course Code"
        placeholder="e.g., BSIT"
        required
      />
      <DataForm.Input
        name="name"
        label="Course Name"
        placeholder="e.g., Bachelor of Science in IT"
        required
      />

      <DataForm.Select
        name="academicLevelId"
        label="Academic Level"
        required
        options={(academicLevels ?? []).map((acadLevel) => ({
          label: acadLevel.name,
          value: acadLevel._id ?? "",
        }))}
      />

      <DataForm.ArrayInput
        name="yearLevels"
        label="Year Levels"
        fields={[
          { name: "code", placeholder: "e.g., Y1" },
          { name: "name", placeholder: "e.g., 1st Year" },
        ]}
      />
    </DataForm>
  );
}
