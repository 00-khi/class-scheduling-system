import {
  UnscheduledSubjectRow,
  TableState,
} from "../../unscheduled-subject-manager";
import {
  DataTableToolbar,
  DataTableToolbarGroup,
} from "@/ui/components/data-table-components";
import { Input } from "@/ui/shadcn/input";
import { cn } from "@/lib/shadcn/utils";
import {
  CalendarPlus,
  CircleX,
  Columns3,
  Filter,
  PlusIcon,
  RefreshCcw,
  Search,
  TrashIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { Button } from "@/ui/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/shadcn/dropdown-menu";
import { AlertDialog, AlertDialogTrigger } from "@/ui/shadcn/alert-dialog";
import { Dispatch, SetStateAction } from "react";
import { ColumnDef, useReactTable } from "@tanstack/react-table";
import { Badge } from "@/ui/shadcn/badge";
import { useUnscheduledSubjectTable } from "../../hooks/unscheduled/use-unscheduled-subject-table";

export function TableToolbar({
  table,
  tableState,
  setTableState,
  entityData,
  onAdd,
  onRefresh,
}: {
  table: ReturnType<typeof useUnscheduledSubjectTable>;
  tableState: TableState;
  setTableState: Dispatch<SetStateAction<TableState>>;
  entityData: UnscheduledSubjectRow[];
  onAdd: () => void;
  onRefresh: () => void;
}) {
  const hasFilters =
    tableState.globalFilter || tableState.columnFilters.length > 0;

  const hideableColumns = table
    .getAllLeafColumns()
    .filter((col) => col.getCanHide());

  const clearFilters = () => {
    setTableState((prev) => ({
      ...prev,
      globalFilter: "",
      columnFilters: [],
    }));
  };

  return (
    <DataTableToolbar>
      <DataTableToolbarGroup className="transition-all duration-300 ease-in-out">
        {/* Search Input */}
        <div className="relative">
          <Input
            className={cn("pl-9", tableState.globalFilter && "pr-9")}
            value={tableState.globalFilter}
            onChange={(e) =>
              setTableState((prev) => ({
                ...prev,
                globalFilter: e.target.value,
              }))
            }
            placeholder="Search..."
            type="text"
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 pointer-events-none text-muted-foreground/80">
            <Search size={16} />
          </div>
        </div>

        {/* Filter Select - TYPE */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "type")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => ({
              ...prev,
              columnFilters: value ? [{ id: "type", value }] : [],
            }))
          }
        >
          <SelectTrigger>
            <Filter className="text-muted-foreground/80" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {(() => {
              const uniqueTypes = Array.from(
                new Set(entityData.map((item) => item.type).filter(Boolean))
              );

              return uniqueTypes.length > 0 ? (
                uniqueTypes.map((item) => (
                  <SelectItem key={item} value={item ?? ""}>
                    {item}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="-">
                  No data found
                </SelectItem>
              );
            })()}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <CircleX />
            Clear Filters
          </Button>
        )}

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Columns3 />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Column visibility items would go here */}
            {hideableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                onSelect={(event) => event.preventDefault()}
              >
                {typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </DataTableToolbarGroup>

      <DataTableToolbarGroup>
        {/* Refresh Button */}
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCcw className="-ms-1 opacity-60" size={16} />
          Refresh
        </Button>

        {/* Add Button */}
        <Button onClick={onAdd}>
          <CalendarPlus />
          Add Schedule
        </Button>
      </DataTableToolbarGroup>
    </DataTableToolbar>
  );
}
