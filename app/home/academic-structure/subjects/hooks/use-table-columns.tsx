import { ColumnDef } from "@tanstack/react-table";
import { SubjectRow } from "../subject-manager";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { EditIcon, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";

export default function useTableColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (item: SubjectRow) => void;
  onDelete: (item: SubjectRow) => void;
}): ColumnDef<SubjectRow>[] {
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
      enableHiding: false,
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
      header: "Units",
      accessorKey: "units",
      meta: {
        filterVariant: "range",
      },
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("type")}</Badge>
      ),
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
      header: "Courses",
      id: "courses",
      accessorFn: (row) =>
        row.courseSubjects?.map((c) => c.course.name).join(", ") || "N/A",
      cell: ({ row }) => {
        const courseData =
          row.original.courseSubjects?.map(({ course, year }) => ({
            name: course.name,
            code: course.code,
            year: year,
          })) || [];

        return (
          <div className="flex flex-wrap gap-1">
            {courseData.length > 0 ? (
              courseData.map((course, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger>
                    <Badge variant="outline">
                      {course.code} - {course.year}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {course.name} - {course.year}
                  </TooltipContent>
                </Tooltip>
              ))
            ) : (
              <Badge variant="outline">N/A</Badge>
            )}
          </div>
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
