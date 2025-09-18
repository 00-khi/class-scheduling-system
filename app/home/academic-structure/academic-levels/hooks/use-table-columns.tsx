import { ColumnDef } from "@tanstack/react-table";
import { AcademicLevelRow } from "../academic-level-manager";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { EditIcon, TrashIcon } from "lucide-react";

export default function useTableColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (item: AcademicLevelRow) => void;
  onDelete: (item: AcademicLevelRow) => void;
}): ColumnDef<AcademicLevelRow>[] {
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
      header: "Years",
      accessorKey: "yearList",
      cell: ({ row }) => {
        const years: number[] = row.getValue("yearList");
        return (
          <div className="flex flex-wrap gap-1">
            {years.length > 0 ? (
              years.map((year, i) => (
                <Badge key={i} variant="secondary">
                  {year}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>
        );
      },
    },
    {
      id: "courses",
      header: "Courses",
      accessorFn: (row) => row._count?.courses || 0,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original._count?.courses || 0}</Badge>
      ),
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
