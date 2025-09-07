"use client";

import { DataTable } from "@/ui/components/data-table";
import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisIcon, PlusIcon, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";
import {
  IAcademicLevel,
  IAssignedSubject,
  ICourse,
  ISection,
  ISubject,
} from "@/types";
import {
  getAssignedSubjects,
  addAssignedSubject,
  deleteAssignedSubject,
} from "@/services/assignedSubjectService";
import { toast } from "sonner";
import { Badge } from "@/shadcn/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";
import { getSubjects } from "@/services/subjectService";
import { getSections } from "@/services/sectionService";
import { getAcademicLevels } from "@/services/academicLevelService";
import { getCourses } from "@/services/courseService";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/components/ui/tabs";

export default function AvailableSubjectsTable({
  selectedSection,
  onChange,
  refreshKey,
}: {
  selectedSection: string;
  onChange: () => void;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<IAssignedSubject[]>(
    []
  );
  const [sections, setSections] = useState<ISection[]>([]);
  const [academicLevels, setAcademicLevels] = useState<IAcademicLevel[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [ignoreSectionFilter, setIgnoreSectionFilter] = useState(false);
  const [isAssigning, setIsAssigning] = useState<string | null>(null); // subjectId being assigned

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setSubjects(getSubjects());
      setAssignedSubjects(getAssignedSubjects());
      setSections(getSections());
      setAcademicLevels(getAcademicLevels());
      setCourses(getCourses());
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const section = useMemo(
    () => sections.find((s) => s.id === selectedSection) || null,
    [sections, selectedSection]
  );

  // subjects already assigned to the selected section (subjectId set)
  const assignedSubjectIdsForSection = useMemo(() => {
    if (!selectedSection) return new Set<string>();
    return new Set(
      assignedSubjects
        .filter((as) => as.sectionId === selectedSection)
        .map((as) => as.subjectId)
    );
  }, [assignedSubjects, selectedSection]);

  // filtered list: match academicLevel/course/yearLevel from the section and exclude already assigned
  const filteredSubjects = useMemo(() => {
    if (!section || ignoreSectionFilter) {
      // if no section selected or user opted to ignore the filter — show all subjects EXCLUDING those already assigned to selectedSection
      return subjects.filter((s) => !assignedSubjectIdsForSection.has(s.id!));
    }

    return subjects.filter((s) => {
      // match all three fields (academicLevelId, courseId, yearLevelId) to the section
      const matchesSection =
        s.academicLevelId === section.academicLevelId &&
        s.courseId === section.courseId &&
        s.yearLevelId === section.yearLevelId;
      // exclude assigned ones
      return matchesSection && !assignedSubjectIdsForSection.has(s.id!);
    });
  }, [subjects, section, assignedSubjectIdsForSection, ignoreSectionFilter]);

  const handleAssignSubject = async (subjectId: string) => {
    if (!subjectId) return;

    if (!selectedSection) {
      toast.error("Select a section before assigning");
      return;
    }

    setIsAssigning(subjectId);

    try {
      if (addAssignedSubject({ sectionId: selectedSection, subjectId })) {
        setAssignedSubjects(getAssignedSubjects());
        onChange();
        toast.success("Subject assigned");
      } else {
        toast.error("Failed to assign subject");
      }
    } catch (error) {
      toast.error("Error assigning subject");
      console.error("Error assigning subject:", error);
    } finally {
      setIsAssigning(null);
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
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const subj = row.original;
        return (
          <Button
            size="icon"
            onClick={() => handleAssignSubject(subj.id!)}
            disabled={isAssigning !== null}
            className="size-7"
          >
            {isAssigning === subj.id ? (
              <Loader2 className="animate-spin" />
            ) : (
              <PlusIcon />
            )}
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Subject Code",
      accessorKey: "code",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("code")}</Badge>
      ),
    },
    {
      header: "Subject Title",
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
          data={filteredSubjects}
          columns={columns}
          initialState={{
            columnVisibility: {
              academicLevelId: false,
              courseId: false,
              yearLevelId: false,
              units: false,
            },
          }}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={ignoreSectionFilter ? "all" : "filtered"}>
              <TabsList>
                <TabsTrigger
                  onClick={() => {
                    if (ignoreSectionFilter)
                      setIgnoreSectionFilter(!ignoreSectionFilter);
                  }}
                  value="filtered"
                >
                  Filtered
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => {
                    if (!ignoreSectionFilter)
                      setIgnoreSectionFilter(!ignoreSectionFilter);
                  }}
                  value="all"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <DataTable.Search
              column="title"
              placeholder="Search subjects..."
              className="max-w-full w-full"
            />
            <div className="flex flex-wrap items-center gap-3 max-w-full">
              <DataTable.Filter column="type" placeholder="All types" />
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
