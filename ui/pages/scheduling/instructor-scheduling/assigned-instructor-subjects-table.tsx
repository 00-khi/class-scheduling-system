"use client";

import { DataTable } from "@/ui/components/data-table";
import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, MinusIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/shadcn/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";
import {
  IScheduleOfInstructor,
  IScheduledSubject,
  IAssignedSubject,
  ISubject,
  ISection,
  IRoom,
} from "@/types";
import {
  getScheduleOfInstructors,
  deleteScheduleOfInstructor,
} from "@/services/scheduleOfInstructorService";
import { getScheduledSubjects } from "@/services/scheduledSubjectService";
import { getAssignedSubjectById } from "@/services/assignedSubjectService";
import { getSubjects } from "@/services/subjectService";
import { getSections } from "@/services/sectionService";
import { getRooms } from "@/services/roomService";

export default function AssignedInstructorSubjectsTable({
  selectedInstructor,
  onChange,
  refreshKey,
}: {
  selectedInstructor: string | null;
  onChange: () => void;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [isUnassigning, setIsUnassigning] = useState<string | null>(null);
  const [scheduleOfInstructor, setScheduleOfInstructor] = useState<
    IScheduleOfInstructor[]
  >([]);
  const [scheduledSubjects, setScheduledSubjects] = useState<
    IScheduledSubject[]
  >([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [rooms, setRooms] = useState<IRoom[]>([]);

  const load = () => {
    setLoading(true);
    setTimeout(() => {
      setScheduleOfInstructor(getScheduleOfInstructors());
      setScheduledSubjects(getScheduledSubjects());
      setSubjects(getSubjects());
      setSections(getSections());
      setRooms(getRooms());
      setLoading(false);
    }, 200);
  };

  useEffect(() => {
    load();
  }, [selectedInstructor, refreshKey]);

  const filtered = useMemo(() => {
    if (!selectedInstructor) return [] as Array<any>;

    return scheduleOfInstructor
      .filter((s) => s.instructorId === selectedInstructor)
      .map((s) => {
        const scheduled = scheduledSubjects.find(
          (ss) => ss.id === s.assignedSubjectId
        ) as IScheduledSubject | undefined;
        const assigned =
          getAssignedSubjectById(scheduled?.assignedSubjectId || "") ||
          ({} as IAssignedSubject);
        const subject = getSubjects().find((x) => x.id === assigned.subjectId);
        const section = getSections().find((x) => x.id === assigned.sectionId);
        const room = getRooms().find((x) => x.id === scheduled?.roomId);
        return { record: s, scheduled, assigned, subject, section, room };
      })
      .filter((r) => r.scheduled);
  }, [
    scheduleOfInstructor,
    scheduledSubjects,
    subjects,
    sections,
    rooms,
    selectedInstructor,
  ]);

  const handleUnassign = (id: string) => {
    if (!id) {
      toast.error("Invalid id");
      return;
    }

    setIsUnassigning(id);
    try {
      if (deleteScheduleOfInstructor(id)) {
        toast.success("Unassigned");
        onChange();
      } else toast.error("Failed to unassign");
    } catch (err) {
      console.error(err);
      toast.error("Error unassigning");
    } finally {
      setIsUnassigning(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const r = row.original;
        const id = r.record.id || "";
        return (
          <Button
            size="icon"
            variant="destructive"
            onClick={() => id && handleUnassign(id)}
            disabled={isUnassigning !== null}
            className="size-7"
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
      header: "Day",
      accessorFn: (row) => row.scheduled?.dayOfWeek,
    },
    {
      header: "Time",
      accessorFn: (row) =>
        `${row.scheduled?.startTime} - ${row.scheduled?.endTime}`,
    },
    {
      header: "Room",
      accessorFn: (row) => row.room?.name || "Unknown",
    },
    {
      header: "Subject",
      accessorFn: (row) => row.subject?.title || "Unknown",
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    {
      header: "Section",
      accessorFn: (row) => row.section?.name,
    },
  ];

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading</span>
        </div>
      ) : !selectedInstructor ? (
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            Select an instructor
          </span>
        </div>
      ) : (
        <DataTable data={filtered} columns={columns}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div />
            <div>
              <Button variant="outline" onClick={load}>
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
