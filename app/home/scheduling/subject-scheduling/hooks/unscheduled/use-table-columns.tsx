import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { EditIcon, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";
import { UnscheduledSubjectRow } from "../../unscheduled-subject-manager";
import { Progress } from "@/ui/shadcn/progress";
import { toHours, toMinutes } from "@/lib/schedule-utils";

export default function useTableColumns(): ColumnDef<UnscheduledSubjectRow>[] {
  return [
    {
      id: "progress", // TO FIX
      header: "Progress",
      accessorFn: (row) => row.scheduledMinutes || 0,
      cell: ({ row }) => {
        const scheduledUnits = toHours(row.original.scheduledMinutes || 0);
        const totalUnits = toHours(
          row.original.requiredMinutes || row.original.units
        );

        const percent = (scheduledUnits / totalUnits) * 100;
        const isExceed = scheduledUnits > totalUnits;

        return (
          <div className="w-full flex flex-row gap-2 items-center">
            <Tooltip>
              <TooltipTrigger>
                <Progress
                  value={isExceed ? 100 : percent}
                  className={`w-40 ${isExceed ? "[&>div]:bg-destructive" : ""}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                {scheduledUnits} / {totalUnits} hrs
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
    {
      header: "Hours",
      accessorKey: "hours",
      cell: ({ getValue }) => {
        return <Badge variant="secondary">{getValue<number>()}</Badge>;
      },
    },
    {
      header: "Subject",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex flex-row gap-1">
          {/* <Badge variant="outline">{row.original.code}</Badge> */}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
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
