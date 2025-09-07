import {
  minutesFromTime,
  DAYS_OF_WEEK,
  toHours,
  durationMinutes,
  formatTime,
} from "@/lib/scheduleUtils";
import {
  getAssignedSubjects,
  getAssignedSubjectById,
} from "@/services/assignedSubjectService";
import { getRooms } from "@/services/roomService";
import {
  getScheduledSubjects,
  deleteScheduledSubject,
} from "@/services/scheduledSubjectService";
import { getSubjects } from "@/services/subjectService";
import { Badge } from "@/shadcn/components/ui/badge";
import { Button } from "@/shadcn/components/ui/button";
import { IScheduledSubject, IAssignedSubject, ISubject, IRoom } from "@/types";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataTable } from "@/ui/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Loader2, RefreshCcw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

export function ScheduledSubjectsTable({
  selectedSection,
  onChange,
  refreshKey,
}: {
  selectedSection: string;
  onChange: () => void;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState<IScheduledSubject[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<IAssignedSubject[]>(
    []
  );
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [scheduledSubjects, setScheduledSubjects] = useState<
    IScheduledSubject[]
  >([]);

  // delete dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Row | null>(null);

  const load = () => {
    setLoading(true);
    setTimeout(() => {
      setScheduled(getScheduledSubjects());
      setAssignedSubjects(getAssignedSubjects());
      setSubjects(getSubjects());
      setRooms(getRooms());
      setScheduledSubjects(getScheduledSubjects());
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    load();
  }, [selectedSection, refreshKey]);

  const totalScheduledInMinutes = useMemo(() => {
    const map = new Map<string, number>();

    scheduledSubjects
      .filter((s) => {
        const asg = getAssignedSubjectById(s.assignedSubjectId);
        return asg?.sectionId === selectedSection;
      })
      .forEach((s) => {
        const currentTotalMinutes = map.get(s.assignedSubjectId) || 0;
        map.set(
          s.assignedSubjectId,
          currentTotalMinutes + durationMinutes(s.startTime, s.endTime)
        );
      });
    return map; // minutes
  }, [scheduledSubjects, selectedSection]);

  type Row = IScheduledSubject & {
    subject: ISubject | undefined;
    room: IRoom | undefined;
    requiredMinutes: number;
    scheduledMinutes: number;
  };

  const data: Row[] = useMemo(() => {
    const rows = scheduled
      .filter((s) => {
        const asg = getAssignedSubjectById(s.assignedSubjectId);
        return asg?.sectionId === selectedSection;
      })
      .map((s) => {
        const asg = getAssignedSubjectById(s.assignedSubjectId);
        const subj = subjects.find((x) => x.id === asg?.subjectId);

        const room = rooms.find((r) => r.id === s.roomId);

        const requiredMinutes = (subj?.units || 0) * 60;
        const scheduledMinutes = totalScheduledInMinutes.get(asg?.id!) || 0;

        return { ...s, subject: subj, room, requiredMinutes, scheduledMinutes };
      });

    // sort by day, then start time
    return rows.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek)
        return Number(a.dayOfWeek) - Number(b.dayOfWeek);
      return minutesFromTime(a.startTime) - minutesFromTime(b.startTime);
    });
  }, [scheduled, selectedSection, subjects, rooms]);

  const columns: ColumnDef<Row, any>[] = [
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="destructive"
            onClick={() => {
              setToDelete(row.original);
              setIsDeleteOpen(true);
            }}
            className="size-7"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "hours",
      header: "Hours",
      cell: ({ row }) => {
        const { requiredMinutes } = row.original;
        const hourScheduled = toHours(
          durationMinutes(row.original.startTime, row.original.endTime)
        );

        return `${hourScheduled} / ${toHours(requiredMinutes)} hrs`;
      },
    },
    {
      id: "scheduleStatus",
      header: "Schedule Status",
      cell: ({ row }) => {
        const { scheduledMinutes, requiredMinutes } = row.original;
        const isComplete = scheduledMinutes === requiredMinutes;
        const isExceed = scheduledMinutes > requiredMinutes;

        return (
          <>
            {isComplete ? (
              <Badge>Complete</Badge>
            ) : isExceed ? (
              <Badge variant="destructive">Excess</Badge>
            ) : (
              <Badge variant="secondary">Partial</Badge>
            )}
          </>
        );
      },
    },
    {
      id: "room",
      header: "Room",
      accessorFn: (row) => row.room?.name || "Unknown",
    },
    {
      id: "day",
      header: "Day",
      accessorFn: (row) => DAYS_OF_WEEK[Number(row.dayOfWeek)],
    },
    {
      id: "time",
      header: "Time",
      accessorFn: (row) => `${formatTime(row.startTime)} - ${formatTime(row.endTime)}`,
    },
    {
      id: "subjectCode",
      header: "Subject Code",
      accessorFn: (row) => row.subject?.code,
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>()}</Badge>
      ),
    },
    {
      id: "subjectTitle",
      header: "Subject Title",
      accessorFn: (row) => row.subject?.title,
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
  ];

  const roomColumn = columns.find((c) => c.id === "room");
  console.log(roomColumn);

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading, please wait...
          </span>
        </div>
      ) : !selectedSection ? (
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            Select a section...
          </span>
        </div>
      ) : (
        <DataTable data={data} columns={columns}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DataTable.Search
              column="subjectCode"
              placeholder="Search by subject..."
              className="max-w-full w-full"
            />
            <Button variant="outline" onClick={load}>
              <RefreshCcw className="-ms-1 opacity-60" size={16} />
              Refresh
            </Button>
          </div>
          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (toDelete?.id) {
            const ok = deleteScheduledSubject(toDelete.id);
            if (ok) {
              toast.success("Schedule deleted");
              onChange();
              load();
            } else {
              toast.error("Delete failed");
            }
          }
          setIsDeleteOpen(false);
          setToDelete(null);
        }}
        itemName={`${
          toDelete
            ? `${toDelete.subject?.title} | ${
                DAYS_OF_WEEK[Number(toDelete.dayOfWeek)]
              } ${formatTime(toDelete.startTime)}-${formatTime(
                toDelete.endTime
              )}`
            : ""
        }`}
      />
    </div>
  );
}
