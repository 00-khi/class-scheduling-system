import { ColumnDef } from "@tanstack/react-table";
import { CourseRow } from "../course-manager";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { EditIcon, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";

export default function useTableColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (item: CourseRow) => void;
  onDelete: (item: CourseRow) => void;
}): ColumnDef<CourseRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Code",
      accessorKey: "code",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("code")}</Badge>
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
      header: "Academic Level",
      id: "academicLevel",
      accessorFn: (row) => row.academicLevel?.name || "N/A",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">
                {row.original.academicLevel?.code || "N/A"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.academicLevel?.name || "N/A"}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(row.original)}
          >
            <EditIcon size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(row.original)}
          >
            <TrashIcon size={16} />
          </Button>
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
