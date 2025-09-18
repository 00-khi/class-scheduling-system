import { AcademicLevelRow, TableState } from "../academic-level-manager";
import {
  DataTableToolbar,
  DataTableToolbarGroup,
} from "@/ui/components/data-table-components";
import { Input } from "@/ui/shadcn/input";
import { cn } from "@/lib/shadcn/utils";
import { CircleX, Columns3, PlusIcon, Search, TrashIcon } from "lucide-react";
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
import { useAcademicLevelTable } from "../hooks/use-academic-level-table";
import { Badge } from "@/ui/shadcn/badge";

export function TableToolbar({
  table,
  tableState,
  setTableState,
  entityData,
  selectedRowsCount,
  onAdd,
  onBulkDelete,
  entityManagement,
}: {
  table: ReturnType<typeof useAcademicLevelTable>;
  tableState: TableState;
  setTableState: Dispatch<SetStateAction<TableState>>;
  entityData: AcademicLevelRow[];
  selectedRowsCount: number;
  onAdd: () => void;
  onBulkDelete: () => void;
  entityManagement: any;
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

        {/* Filter Select */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "code")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => ({
              ...prev,
              columnFilters: value ? [{ id: "code", value }] : [],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter Code" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {Array.from(new Set(entityData.map((item) => item.code))).map(
              (code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="outline" onClick={clearFilters} className="ml-2">
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
        {/* Bulk Delete */}
        {selectedRowsCount > 1 && (
          <AlertDialog
            open={entityManagement.isDeleteSelectedDialogOpen}
            onOpenChange={entityManagement.setIsDeleteSelectedDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <TrashIcon />
                Delete
                <Badge variant="outline">{selectedRowsCount}</Badge>
              </Button>
            </AlertDialogTrigger>
          </AlertDialog>
        )}

        {/* Add Button */}
        <Button onClick={onAdd}>
          <PlusIcon />
          Add Academic Level
        </Button>
      </DataTableToolbarGroup>
    </DataTableToolbar>
  );
}
