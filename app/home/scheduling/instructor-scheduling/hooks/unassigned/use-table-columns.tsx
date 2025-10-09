import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { UserPen } from "lucide-react";
import { formatTime } from "@/lib/schedule-utils";
import { UnassignedSubjectRow } from "../../unassigned-subject-manager";

export default function useTableColumns({
  onEdit,
}: {
  onEdit: (item: UnassignedSubjectRow) => void;
}): ColumnDef<UnassignedSubjectRow>[] {
  return [
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="icon"
            onClick={() => onEdit(row.original)}
            className="size-7"
          >
            <UserPen size={16} />
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
      accessorFn: (row) => row.room?.name || "N/A",
    },
    {
      id: "subject",
      header: "Subject",
      accessorFn: (row) => row.subject?.name || "N/A",
      cell: ({ row }) => (
        <div className="flex flex-row gap-1">
          <span className="font-medium">
            {row.original.subject?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorFn: (row) => row.subject?.type || "N/A",
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
  ];
}
