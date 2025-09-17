import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../shadcn/checkbox";
import { RowActions } from "./row-actions";

export function getSelectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header({ table }) {
      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      );
    },
    cell({ row }) {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  };
}

export function getActionsColumn<T>(actions: {
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}): ColumnDef<T> {
  return {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <RowActions
        item={row.original}
        onEdit={actions.onEdit}
        onDelete={actions.onDelete}
      />
    ),
    enableHiding: false,
    enableSorting: false,
  };
}
