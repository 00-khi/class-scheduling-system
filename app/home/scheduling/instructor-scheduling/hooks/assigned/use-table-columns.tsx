import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { UserMinus } from "lucide-react";
import { diffMinutes, formatTime, toHours } from "@/lib/schedule-utils";
import { ScheduledInstructorRow } from "../../assigned-subject-manager";

export default function useTableColumns({
  onDelete,
}: {
  onDelete: (item: ScheduledInstructorRow) => void;
}): ColumnDef<ScheduledInstructorRow>[] {
  return [
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(row.original)}
            className="size-7"
          >
            <UserMinus size={16} />
          </Button>
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "instructor",
      header: "Instructor",
      accessorFn: (row) => row.instructor.name,
      filterFn: "equals",
    },
    {
      id: "section",
      header: "Section",
      accessorFn: (row) => row.scheduledSubject.section.name || "N/A",
    },
    {
      id: "day",
      header: "Day",
      accessorFn: (row) => row.scheduledSubject.day,
    },
    {
      id: "time",
      header: "Time",
      accessorFn: (row) =>
        `${formatTime(row.scheduledSubject.startTime)} - ${formatTime(
          row.scheduledSubject.endTime
        )}`,
    },
    {
      id: "room",
      header: "Room",
      accessorFn: (row) => row.scheduledSubject.room.name,
    },
    {
      id: "subject",
      header: "Subject",
      accessorFn: (row) => row.scheduledSubject.subject.name,
      cell: ({ row }) => (
        <div className="flex flex-row gap-1">
          <span className="font-medium">
            {row.original.scheduledSubject.subject.name}
          </span>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorFn: (row) => row.scheduledSubject.subject.type,
      cell: ({ getValue }) => (
        <Badge
          variant={
            getValue<string>() === "Laboratory" ? "default" : "secondary"
          }
        >
          {getValue<string>()}
        </Badge>
      ),
    },
    {
      id: "hours",
      header: "Hours",
      cell: ({ row }) => {
        const assignedMinutes = diffMinutes(
          row.original.scheduledSubject.startTime,
          row.original.scheduledSubject.endTime
        );

        return `${toHours(assignedMinutes)} hrs`;
      },
    },
  ];
}
