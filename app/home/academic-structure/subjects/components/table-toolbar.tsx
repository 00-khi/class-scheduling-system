import { SubjectRow, TableState } from "../subject-manager";
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
import { useSubjectTable } from "../hooks/use-subject-table";
import { Badge } from "@/ui/shadcn/badge";
import { Semester } from "@prisma/client";
import { replaceUnderscores } from "@/lib/utils";

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
  table: ReturnType<typeof useSubjectTable>;
  tableState: TableState;
  setTableState: Dispatch<SetStateAction<TableState>>;
  entityData: SubjectRow[];
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

  const semesterOptions = Object.values(Semester).map((sem) => ({
    value: sem,
    label: sem,
  }));

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

        {/* Filter Select - SEMESTER */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "semester")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => {
              const newFilters = prev.columnFilters.filter(
                (f) => f.id !== "semester"
              );
              return {
                ...prev,
                columnFilters: value
                  ? [...newFilters, { id: "semester", value }]
                  : newFilters,
              };
            })
          }
        >
          <SelectTrigger>
            <Filter className="text-muted-foreground/80" />
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {semesterOptions.length > 0 ? (
              semesterOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {replaceUnderscores(opt.label)}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="-">
                No data found
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Filter Select - TYPE */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "type")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => {
              const newFilters = prev.columnFilters.filter(
                (f) => f.id !== "type"
              );
              return {
                ...prev,
                columnFilters: value
                  ? [...newFilters, { id: "type", value }]
                  : newFilters,
              };
            })
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

        {/* Filter Select - ACADEMIC LEVEL */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "academicLevel")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => {
              const newFilters = prev.columnFilters.filter(
                (f) => f.id !== "academicLevel"
              );
              return {
                ...prev,
                columnFilters: value
                  ? [...newFilters, { id: "academicLevel", value }]
                  : newFilters,
              };
            })
          }
        >
          <SelectTrigger>
            <Filter className="text-muted-foreground/80" />
            <SelectValue placeholder="Academic Level" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {(() => {
              const uniqueTypes = Array.from(
                new Set(
                  entityData
                    .map((item) => item.academicLevel?.name)
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

        {/* Filter Select - COURSE */}
        <Select
          value={
            (tableState.columnFilters.find((f) => f.id === "courses")
              ?.value as string) ?? ""
          }
          onValueChange={(value) =>
            setTableState((prev) => {
              const newFilters = prev.columnFilters.filter(
                (f) => f.id !== "courses"
              );
              return {
                ...prev,
                columnFilters: value
                  ? [...newFilters, { id: "courses", value }]
                  : newFilters,
              };
            })
          }
        >
          <SelectTrigger>
            <Filter className="text-muted-foreground/80" />
            <SelectValue placeholder="Courses" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {(() => {
              const uniqueCourses = Array.from(
                new Set(
                  entityData
                    .flatMap(
                      (item) =>
                        item.courseSubjects?.map((cs) => cs.course?.name) ?? []
                    )
                    .filter(Boolean)
                )
              );

              return uniqueCourses.length > 0 ? (
                uniqueCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
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
          Add Subject
        </Button>
      </DataTableToolbarGroup>
    </DataTableToolbar>
  );
}
