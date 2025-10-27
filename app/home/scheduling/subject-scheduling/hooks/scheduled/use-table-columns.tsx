import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { CalendarMinus, EditIcon, Trash2, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";
import { Progress } from "@/ui/shadcn/progress";
import {
  diffMinutes,
  formatTime,
  toHours,
  toMinutes,
} from "@/lib/schedule-utils";
import { ScheduledSubjectRow } from "../../scheduled-subject-manager";

export default function useTableColumns({
  onDelete,
}: {
  onDelete: (item: ScheduledSubjectRow) => void;
}): ColumnDef<ScheduledSubjectRow>[] {
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
            <CalendarMinus size={16} />
          </Button>
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      header: "Day",
      accessorKey: "day",
    },
    {
      id: "time",
      header: "Time",
      accessorFn: (row) =>
        `${formatTime(row.startTime)} - ${formatTime(row.endTime)}`,
    },
    {
      id: "room",
      header: "Room",
      accessorFn: (row) => row.room.name,
    },
    {
      id: "subject",
      header: "Subject",
      accessorFn: (row) => row.subject.name,
      cell: ({ row }) => (
        <div className="flex flex-row gap-1">
          <span className="font-medium">{row.original.subject.name}</span>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorFn: (row) => row.subject.type,
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
    // {
    //   id: "hours",
    //   header: "Hours",
    //   cell: ({ row }) => {
    //     const subjectHours = row.original.subject.hours;
    //     const requiredMinutes = subjectHours * 60;
    //     const scheduledMinutes = diffMinutes(
    //       row.original.startTime,
    //       row.original.endTime
    //     );

    //     return `${toHours(scheduledMinutes)} / ${toHours(requiredMinutes)} hrs`;
    //   },
    // },
    // {
    //   id: "status",
    //   header: "Status",
    //   cell: ({ row, table }) => {
    //     const subjectId = row.original.subject.id;
    //     const subjectHours = row.original.subject.hours;
    //     const requiredMinutes = subjectHours * 60;

    //     const scheduledMinutes = table
    //       .getRowModel()
    //       .rows.filter((r) => r.original.subject.id === subjectId)
    //       .reduce(
    //         (total, r) =>
    //           total +
    //           (toMinutes(r.original.endTime) - toMinutes(r.original.startTime)),
    //         0
    //       );

    //     if (scheduledMinutes === requiredMinutes) {
    //       return <Badge>Complete</Badge>;
    //     }
    //     if (scheduledMinutes > requiredMinutes) {
    //       return <Badge variant="destructive">Excess</Badge>;
    //     }
    //     return <Badge variant="secondary">Partial</Badge>;
    //   },
    // },
  ];
}
