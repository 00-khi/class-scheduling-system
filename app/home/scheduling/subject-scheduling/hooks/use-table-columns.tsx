import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { EditIcon, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";
import { UnscheduledSubjectRow } from "../unscheduled-subject-manager";
import { Progress } from "@/ui/shadcn/progress";
import { toMinutes } from "@/lib/scheduleUtils";

export default function useTableColumns(): ColumnDef<UnscheduledSubjectRow>[] {
  return [
    {
      id: "progress", // TO FIX
      header: "Progress",
      accessorFn: (row) => row.scheduledSubject?.length || 0,
      cell: ({ row }) => {
        const scheduledArray = row.original.scheduledSubject || [];

        const scheduledUnits = scheduledArray.reduce((sum, s) => {
          const start = toMinutes(s.startTime);
          const end = toMinutes(s.endTime);
          return sum + (end - start) / 60; // convert minutes to units
        }, 0);

        const totalUnits = row.original.units;
        const percent = Math.min((scheduledUnits / totalUnits) * 100, 100);

        return (
          <div className="w-full flex flex-row gap-2 items-center">
            <Tooltip>
              <TooltipTrigger>
                <Progress value={percent} className="w-40" />
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
      header: "Units",
      accessorKey: "units",
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
