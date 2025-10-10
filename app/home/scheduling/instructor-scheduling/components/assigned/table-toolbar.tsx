import {
  DataTableToolbar,
  DataTableToolbarGroup,
} from "@/ui/components/data-table-components";
import { Input } from "@/ui/shadcn/input";
import { cn } from "@/lib/shadcn/utils";
import {
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
import { useAssignedSubjectTable } from "../../hooks/assigned/use-assigned-subject-table";
import {
  TableState,
  ScheduledInstructorRow,
} from "../../assigned-subject-manager";

export function TableToolbar({
  table,
  tableState,
  setTableState,
  entityData,
  onRefresh,
}: {
  table: ReturnType<typeof useAssignedSubjectTable>;
  tableState: TableState;
  setTableState: Dispatch<SetStateAction<TableState>>;
  entityData: ScheduledInstructorRow[];
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

        {/* Filter Select - INSTRUCTOR */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "instructor")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => ({
              ...prev,
              columnFilters: value ? [{ id: "instructor", value }] : [],
            }))
          }
        >
          <SelectTrigger>
            <Filter className="text-muted-foreground/80" />
            <SelectValue placeholder="Instructor" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {(() => {
              const uniqueTypes = Array.from(
                new Set(
                  entityData.map((item) => item.instructor.name).filter(Boolean)
                )
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

        {/* Filter Select - SECTION */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "section")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => ({
              ...prev,
              columnFilters: value ? [{ id: "section", value }] : [],
            }))
          }
        >
          <SelectTrigger>
            <Filter className="text-muted-foreground/80" />
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {(() => {
              const uniqueTypes = Array.from(
                new Set(
                  entityData
                    .map((item) => item.scheduledSubject.section.name)
                    .filter(Boolean)
                )
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

        {/* Filter Select - DAY */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "day")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => ({
              ...prev,
              columnFilters: value ? [{ id: "day", value }] : [],
            }))
          }
        >
          <SelectTrigger>
            <Filter className="text-muted-foreground/80" />
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {(() => {
              const uniqueTypes = Array.from(
                new Set(
                  entityData
                    .map((item) => item.scheduledSubject.day)
                    .filter(Boolean)
                )
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
                new Set(
                  entityData
                    .map((item) => item.scheduledSubject.subject.type)
                    .filter(Boolean)
                )
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
      </DataTableToolbarGroup>
    </DataTableToolbar>
  );
}
