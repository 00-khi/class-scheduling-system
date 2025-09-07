"use client";

import { DataTable } from "@/ui/components/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon, Loader2, MinusIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import {
  IAcademicLevel,
  ICourse,
  ISection,
  ISubject,
  IAssignedSubject,
} from "@/types";
import {
  getAssignedSubjects,
  deleteAssignedSubject,
} from "@/services/assignedSubjectService";
import { toast } from "sonner";
import { Badge } from "@/shadcn/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";
import { getAcademicLevels } from "@/services/academicLevelService";
import { getCourses } from "@/services/courseService";
import { getSubjects } from "@/services/subjectService";
import { getSections } from "@/services/sectionService";

export default function AssignedSubjectsTable({
  selectedSection,
  onChange,
  refreshKey,
}: {
  selectedSection: string;
  onChange: () => void;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [isUnassigning, setIsUnassigning] = useState<string | null>(null); // id being unassigned
  const [assignedSubjects, setAssignedSubjects] = useState<IAssignedSubject[]>(
    []
  );
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [academicLevels, setAcademicLevels] = useState<IAcademicLevel[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);

  const loadData = () => {
    setLoading(true);
    // mimic async load (your services appear synchronous; keep this delay if you like)
    setTimeout(() => {
      const allAssigned = getAssignedSubjects();
      setAssignedSubjects(
        selectedSection
          ? allAssigned.filter((a) => a.sectionId === selectedSection)
          : allAssigned
      );

      setSubjects(getSubjects());
      setSections(getSections());
      setAcademicLevels(getAcademicLevels());
      setCourses(getCourses());
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    loadData();
    // reload when selectedSection changes
  }, [selectedSection, refreshKey]);

  const handleUnassignSubject = (id: string) => {
    if (!id) {
      toast.error("Invalid ID");
      return;
    }

    setIsUnassigning(id);

    try {
      if (deleteAssignedSubject(id)) {
        toast.success("Successfully unassigned subject");
        onChange();
      } else {
        toast.error("Failed to unassign subject");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error unassigning subject");
    } finally {
      setIsUnassigning(null);
    }
  };

  // ----- relationship helpers -----
  const getSubject = (subjectId: string): ISubject => {
    const subject = subjects.find((s) => s.id === subjectId);
    return (
      subject ?? {
        code: "Unknown",
        title: "Unknown",
        type: "Lecture",
        units: 0,
        academicLevelId: "",
        courseId: "",
        yearLevelId: "",
        semester: "",
      }
    );
  };

  const getSection = (sectionId: string) => {
    const sect = sections.find((s) => s.id === sectionId);
    return (
      sect ?? {
        name: "Unknown",
        academicLevelId: "",
        courseId: "",
        yearLevelId: "",
      }
    );
  };

  const getAcademicLevel = (academicLevelId: string) => {
    const al = academicLevels.find((a) => a.id === academicLevelId);
    return al
      ? { code: al.code, name: al.name }
      : { code: "Unknown", name: "Unknown" };
  };

  const getCourse = (courseId: string) => {
    const c = courses.find((c) => c.id === courseId);
    return c
      ? { code: c.code, name: c.name }
      : { code: "Unknown", name: "Unknown" };
  };

  const getYearLevelByCourseId = (courseId: string, yearLevelId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { code: "Unknown", name: "Unknown" };
    const yl = course.yearLevels?.find((y) => y.id === yearLevelId);
    return yl
      ? { code: yl.code, name: yl.name }
      : { code: "Unknown", name: "Unknown" };
  };

  // ----- columns -----
  // Use accessorFn so the table has a proper value for filtering/sorting and each column has a unique id
  const columns: ColumnDef<IAssignedSubject, any>[] = [
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const subj = row.original;
        // leave guard in case id is undefined (interface says it's required but being defensive)
        const id = subj.id ?? "";
        return (
          <Button
            size="icon"
            onClick={() => id && handleUnassignSubject(id)}
            disabled={isUnassigning !== null}
            className="size-7"
            variant="destructive"
          >
            {isUnassigning === id ? (
              <Loader2 className="animate-spin" />
            ) : (
              <MinusIcon />
            )}
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },

    {
      id: "subjectCode",
      header: "Subject Code",
      accessorFn: (row) => getSubject(row.subjectId).code,
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>()}</Badge>
      ),
    },
    {
      id: "subjectTitle",
      header: "Subject Title",
      accessorFn: (row) => getSubject(row.subjectId).title,
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorFn: (row) => getSubject(row.subjectId).type,
      cell: ({ getValue }) => {
        const type = getValue<"Lecture" | "Laboratory">();
        return (
          <Badge variant={type === "Laboratory" ? "default" : "secondary"}>
            {type}
          </Badge>
        );
      },
    },
    {
      id: "units",
      header: "Units",
      accessorFn: (row) => getSubject(row.subjectId).units,
      cell: ({ getValue }) => (
        <Badge variant="secondary">{getValue<number>()}</Badge>
      ),
    },
    {
      id: "semester",
      header: "Semester",
      accessorFn: (row) => getSubject(row.subjectId).semester,
      cell: ({ getValue }) => <div>{getValue<string>()}</div>,
    },
    {
      id: "section",
      header: "Section",
      accessorFn: (row) => getSection(row.sectionId).name,
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    {
      id: "academicLevel",
      header: "Academic Level",
      accessorFn: (row) =>
        getAcademicLevel(getSubject(row.subjectId).academicLevelId).code,
      cell: ({ row, getValue }) => {
        const code = getValue<string>();
        const subj = getSubject(row.original.subjectId);
        const { name } = getAcademicLevel(subj.academicLevelId);
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
      id: "course",
      header: "Course",
      accessorFn: (row) => getCourse(getSubject(row.subjectId).courseId).code,
      cell: ({ row, getValue }) => {
        const code = getValue<string>();
        const subj = getSubject(row.original.subjectId);
        const { name } = getCourse(subj.courseId);
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
      id: "yearLevel",
      header: "Year Level",
      accessorFn: (row) =>
        getYearLevelByCourseId(
          getSubject(row.subjectId).courseId,
          getSubject(row.subjectId).yearLevelId
        ).code,
      cell: ({ row, getValue }) => {
        const code = getValue<string>();
        const subj = getSubject(row.original.subjectId);
        const { name } = getYearLevelByCourseId(
          subj.courseId,
          subj.yearLevelId
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
      ) : !selectedSection ? (
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            Select a section...
          </span>
        </div>
      ) : (
        <DataTable
          data={assignedSubjects}
          columns={columns}
          initialState={{
            columnFilters: [
              {
                id: "section",
                value: getSection(selectedSection).name,
              },
            ],
            columnVisibility: {
              section: false,
            },
          }}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DataTable.Search
              column="subjectTitle"
              placeholder="Search subjects..."
              className="max-w-full w-full"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={loadData}>
                <RefreshCcw className="-ms-1 opacity-60" size={16} />
                Refresh
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}
    </div>
  );
}
