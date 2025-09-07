"use client";

import { DataTable } from "@/ui/components/data-table";
import { useEffect, useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, PlusIcon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Badge } from "@/shadcn/components/ui/badge";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";
import {
  IAssignedSubject,
  IScheduledSubject,
  ISubject,
  ISection,
  IRoom,
} from "@/types";
import {
  getAssignedSubjects,
  getAssignedSubjectById,
} from "@/services/assignedSubjectService";
import { getScheduledSubjects } from "@/services/scheduledSubjectService";
import { getSubjects } from "@/services/subjectService";
import { getSections } from "@/services/sectionService";
import { getRooms } from "@/services/roomService";
import {
  getScheduleOfInstructors,
  addScheduleOfInstructor,
} from "@/services/scheduleOfInstructorService";
import { minutesFromTime } from "@/lib/scheduleUtils";

export default function UnassignedInstructorSubjectsTable({
  selectedInstructor,
  onChange,
  refreshKey,
}: {
  selectedInstructor: string | null;
  onChange: () => void;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [assignedSubjects, setAssignedSubjects] = useState<IAssignedSubject[]>(
    []
  );
  const [scheduledSubjects, setScheduledSubjects] = useState<
    IScheduledSubject[]
  >([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isAssigning, setIsAssigning] = useState<string | null>(null); // scheduledSubjectId

  const load = () => {
    setLoading(true);
    setTimeout(() => {
      setAssignedSubjects(getAssignedSubjects());
      setScheduledSubjects(getScheduledSubjects());
      setSubjects(getSubjects());
      setSections(getSections());
      setRooms(getRooms());
      setLoading(false);
    }, 200);
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  // instructor existing schedules
  const instructorSchedules = useMemo(() => {
    if (!selectedInstructor) return [] as IScheduledSubject[];
    const map = getScheduleOfInstructors();
    return map
      .filter((s) => s.instructorId === selectedInstructor)
      .map((x) =>
        getScheduledSubjects().find((ss) => ss.id === x.assignedSubjectId)
      )
      .filter(Boolean) as IScheduledSubject[];
  }, [selectedInstructor, refreshKey]);

  const rows = useMemo(() => {
    // create rows from scheduledSubjects that belong to assignedSubjects
    return scheduledSubjects
      .map((s) => {
        const asg = getAssignedSubjectById(s.assignedSubjectId);
        if (!asg) return null;
        const subj = subjects.find((x) => x.id === asg.subjectId);
        const sect = sections.find((r) => r.id === asg.sectionId);
        const room = rooms.find((r) => r.id === s.roomId);
        return {
          scheduled: s,
          assigned: asg,
          subject: subj,
          section: sect,
          room,
        };
      })
      .filter(Boolean) as Array<{
      scheduled: IScheduledSubject;
      assigned: IAssignedSubject;
      subject?: ISubject;
      section?: ISection;
      room?: IRoom;
    }>;
  }, [scheduledSubjects, assignedSubjects, subjects, sections, rooms]);

  const hasConflict = (candidate: IScheduledSubject) => {
    const cStart = minutesFromTime(candidate.startTime);
    const cEnd = minutesFromTime(candidate.endTime);
    return instructorSchedules.some((s) => {
      if (s.dayOfWeek !== candidate.dayOfWeek) return false;
      const sStart = minutesFromTime(s.startTime);
      const sEnd = minutesFromTime(s.endTime);
      return cStart < sEnd && sStart < cEnd;
    });
  };

  const handleAssignToInstructor = async (scheduled: IScheduledSubject) => {
    if (!selectedInstructor) {
      toast.error("Select an instructor");
      return;
    }

    setIsAssigning(scheduled.id!);

    try {
      if (hasConflict(scheduled)) {
        toast.error("Schedule conflict with instructor schedule");
        return;
      }

      const payload = {
        assignedSubjectId: scheduled.id!,
        instructorId: selectedInstructor,
      };

      const ok = addScheduleOfInstructor(payload);
      if (ok) {
        toast.success("Assigned to instructor");
        onChange();
      } else {
        toast.error("Failed to assign");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error assigning");
    } finally {
      setIsAssigning(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <Button
            size="icon"
            onClick={() => handleAssignToInstructor(r.scheduled)}
            disabled={isAssigning !== null}
            className="size-7"
          >
            {isAssigning === r.scheduled.id ? (
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
      header: "Day",
      accessorFn: (row) => row.scheduled.dayOfWeek,
    },
    {
      header: "Time",
      accessorFn: (row) =>
        `${row.scheduled.startTime} - ${row.scheduled.endTime}`,
    },
    {
      header: "Room",
      accessorFn: (row) => row.room?.name || "Unknown",
    },
    {
      header: "Subject",
      accessorFn: (row) => row.subject?.title,
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
      ) : (
        <DataTable data={rows} columns={columns}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div />
            <div>
              <Button variant="outline" onClick={load}>
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
