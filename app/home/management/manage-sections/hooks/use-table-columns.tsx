import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { EditIcon, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";
import { Progress } from "@/ui/shadcn/progress";
import { toHours, toMinutes } from "@/lib/schedule-utils";
import { SectionRow } from "../section-manager";

export default function useTableColumns(): ColumnDef<SectionRow>[] {
  return [
    {
      header: "Academic Level",
      id: "academicLevel",
      accessorFn: (row) => row.course?.academicLevel?.name || "N/A",
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline">
              {row.original.course?.academicLevel?.code || "N/A"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {row.original.course?.academicLevel?.name || "N/A"}
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      enableHiding: false,
    },
    {
      header: "Course",
      id: "course",
      accessorFn: (row) => row.course?.name || "N/A",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">
                {row.original.course?.code || "N/A"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.course?.name || "N/A"}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      id: "year",
      header: "Year",
      accessorFn: (row) => String(row.year ?? ""),
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.original.year || "N/A"}</Badge>;
      },
      filterFn: "equals",
    },
  ];
}
