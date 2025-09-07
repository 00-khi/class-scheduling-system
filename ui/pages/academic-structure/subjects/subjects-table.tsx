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
import { IAcademicLevel, ICourse, ISubject } from "@/types";
import {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} from "@/services/subjectService";
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

export default function SubjectsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ISubject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [academicLevels, setAcademicLevels] = useState<IAcademicLevel[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);

  // 🆕 delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<ISubject | null>(null);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setSubjects(getSubjects());
      setAcademicLevels(getAcademicLevels());
      setCourses(getCourses());
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD
  const handleAddSubject = async (subjectData: Omit<ISubject, "id">) => {
    setIsSubmitting(true);
    try {
      if (!subjectData.code) {
        toast.error("Subject code is required");
      }

      if (!subjectData.title) {
        toast.error("Subject title is required");
        return;
      }

      if (!subjectData.type) {
        toast.error("Subject type is required");
        return;
      }

      if (!subjectData.units) {
        toast.error("Subject units are required");
        return;
      }

      if (!subjectData.academicLevelId) {
        toast.error("Academic level is required");
        return;
      }

      if (!subjectData.courseId) {
        toast.error("Course is required");
        return;
      }

      if (!subjectData.yearLevelId) {
        toast.error("Year level is required");
        return;
      }

      if (!subjectData.semester) {
        toast.error("Semester is required");
        return;
      }

      if (addSubject(subjectData)) {
        toast.success(`Subject added successfully`);
        loadData();
      } else {
        toast.error("Failed to add subject");
      }
      setIsAddDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdateSubject = async (subjectData: ISubject) => {
    if (!subjectData.id) return;
    setIsSubmitting(true);
    try {
      if (!subjectData.code) {
        toast.error("Subject code is required");
      }

      if (!subjectData.title) {
        toast.error("Subject title is required");
        return;
      }

      if (!subjectData.type) {
        toast.error("Subject type is required");
        return;
      }

      if (!subjectData.units) {
        toast.error("Subject units are required");
        return;
      }

      if (!subjectData.academicLevelId) {
        toast.error("Academic level is required");
        return;
      }

      if (!subjectData.courseId) {
        toast.error("Course is required");
        return;
      }

      if (!subjectData.yearLevelId) {
        toast.error("Year level is required");
        return;
      }

      if (!subjectData.semester) {
        toast.error("Semester is required");
        return;
      }

      const { id: id, ...data } = subjectData;

      if (updateSubject(id, data)) {
        toast.success(`Subject updated successfully`);
        loadData();
      } else {
        toast.error("Failed to update subject");
      }

      setIsEditDialogOpen(false);
      setEditingSubject(null);
    } catch (error) {
      toast.error("Error updating subject");
      console.error("Error updating subject:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteSubject = (id: string) => {
    try {
      if (!id) {
        toast.error("Error deleting subject: Invalid ID");
        return;
      }
      if (deleteSubject(id)) {
        toast.success(`Subject deleted successfully`);
        loadData();
      } else {
        toast.error("Failed to delete subject");
      }
    } catch (error) {
      toast.error("Error deleting subject");
      console.error("Error deleting subject:", error);
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

  const columns: ColumnDef<ISubject>[] = [
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
      header: "Code",
      accessorKey: "code",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("code")}</Badge>
      ),
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => {
        const status = row.getValue<string>("type");
        return (
          <Badge variant={status === "Laboratory" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      header: "Units",
      accessorKey: "units",
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.getValue("units")}</Badge>;
      },
    },
    {
      header: "Semester",
      accessorKey: "semester",
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
        const subject = row.original;
        const { code, name } = getYearLevelByCourseId(
          subject.courseId,
          subject.yearLevelId
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
          subject={row.original}
          onEdit={(sub) => {
            setEditingSubject(sub);
            setIsEditDialogOpen(true);
          }}
          onDelete={(sub) => {
            setSubjectToDelete(sub);
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
        <DataTable data={subjects} columns={columns}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.Search
                column="title"
                placeholder="Search subjects..."
                className="max-w-sm"
              />
              <DataTable.Filter column="type" placeholder="All types" />
              {/* <DataTable.Filter column="units" placeholder="All units" /> */}
              <DataTable.Filter column="semester" placeholder="All semesters" />
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
                  ids.forEach((id) => handleDeleteSubject(id));
                }}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add Subject
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      <SubjectForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddSubject}
        isLoading={isSubmitting}
        courses={courses}
        academicLevels={academicLevels}
      />

      <SubjectForm
        item={editingSubject || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={handleUpdateSubject}
        isLoading={isSubmitting}
        academicLevels={academicLevels}
        courses={courses}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (subjectToDelete?.id) {
            handleDeleteSubject(subjectToDelete.id);
          }
          setIsDeleteDialogOpen(false);
          setSubjectToDelete(null);
        }}
        itemName={subjectToDelete?.title}
      />
    </div>
  );
}

function RowActions({
  subject,
  onEdit,
  onDelete,
}: {
  subject: ISubject;
  onEdit: (sub: ISubject) => void;
  onDelete: (sub: ISubject) => void;
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
        <DropdownMenuItem onClick={() => onEdit(subject)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(subject)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SubjectForm({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
  academicLevels,
  courses,
}: {
  isOpen: boolean;
  item?: ISubject;
  onClose: () => void;
  onSubmit: (data: ISubject) => void;
  isLoading?: boolean;
  academicLevels: IAcademicLevel[];
  courses: ICourse[];
}) {
  const [formData, setFormData] = useState<ISubject>(
    item || ({} as Omit<ISubject, "id">)
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
    setFormData(item || ({} as ISubject));
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
    <DataForm<ISubject>
      item={formData}
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={{ add: "Add Subject", edit: "Edit Subject" }}
    >
      <DataForm.Input
        name="code"
        label="Subject Code"
        placeholder="e.g., CS101"
        onValueChange={(value: string) => handleChange(value, "code")}
        required
      />
      <DataForm.Input
        name="title"
        label="Subject Title"
        placeholder="e.g, Introduction to Computer Science"
        onValueChange={(value: string) => handleChange(value, "title")}
        required
      />
      <DataForm.Select
        name="type"
        label="Type"
        options={[
          { value: "Lecture", label: "Lecture" },
          { value: "Laboratory", label: "Laboratory" },
        ]}
        onValueChange={(value: string) => handleChange(value, "type")}
        required
      />
      <DataForm.Input
        type="number"
        name="units"
        label="Units"
        placeholder="e.g., 3"
        required
        onValueChange={(value: string) => handleChange(value, "units")}
      />
      <DataForm.Input
        name="semester"
        label="Semester"
        placeholder="e.g., 1st Semester"
        required
        onValueChange={(value: string) => handleChange(value, "semester")}
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
