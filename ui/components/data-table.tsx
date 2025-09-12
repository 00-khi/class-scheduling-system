"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/shadcn/table";
import { Card } from "@/ui/shadcn/card";
import { Input } from "@/ui/shadcn/input";
import { Button } from "@/ui/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/shadcn/dropdown-menu";
import {
  CircleAlertIcon,
  CircleX,
  Columns3,
  Filter,
  Search,
  TrashIcon,
} from "lucide-react";
import { cn } from "@/lib/shadcn/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/shadcn/alert-dialog";

// Context for sharing table state
interface DataTableContextValue<TData> {
  table: TanStackTable<TData>;
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

function useDataTableContext<TData>() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error(
      "DataTable components must be used within DataTableProvider"
    );
  }
  return context;
}

// Main DataTable component with provider
interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  children?: ReactNode;
  initialState?: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    pagination?: PaginationState;
  };
}

function DataTableProvider<TData, TValue>({
  data,
  columns,
  children,
  initialState = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(
    initialState.sorting || []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState.columnFilters || []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState.columnVisibility || {}
  );
  const [pagination, setPagination] = useState<PaginationState>(
    initialState.pagination || { pageIndex: 0, pageSize: 10 }
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <DataTableContext.Provider value={{ table }}>
      {children}
    </DataTableContext.Provider>
  );
}

// Table component
function DataTableContent<TData>() {
  const { table } = useDataTableContext();

  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  // style={{ width: `${header.getSize()}px` }}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <div
                      className={cn(
                        header.column.getCanSort() &&
                          "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        // Enhanced keyboard handling for sorting
                        if (
                          header.column.getCanSort() &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          header.column.getToggleSortingHandler()?.(e);
                        }
                      }}
                      tabIndex={header.column.getCanSort() ? 0 : undefined}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="**:data-[slot=table-cell]:first:w-8">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

// Search input component
interface DataTableSearchProps {
  column: string;
  placeholder?: string;
  className?: string;
}

function DataTableSearch({
  column,
  placeholder = "Search...",
  className,
}: DataTableSearchProps) {
  const { table } = useDataTableContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const columnObj = table.getColumn(column);
  const filterValue = (columnObj?.getFilterValue() ?? "") as string;

  if (!columnObj) {
    console.warn(`Column "${column}" not found in table`);
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        className={cn("pl-9", filterValue && "pr-9")}
        value={filterValue}
        onChange={(e) => columnObj.setFilterValue(e.target.value)}
        placeholder={placeholder}
        type="text"
      />
      <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 pointer-events-none text-muted-foreground/80">
        <Search size={16} />
      </div>
      {filterValue && (
        <button
          className="absolute inset-y-0 right-0 flex items-center justify-center w-9 h-full text-muted-foreground/80 hover:text-foreground transition-colors"
          onClick={() => {
            columnObj.setFilterValue("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
        >
          <CircleX size={16} />
        </button>
      )}
    </div>
  );
}

// Filter select component
interface DataTableFilterProps {
  column: string;
  placeholder?: string;
  className?: string;
  renderValue?: (value: string) => string;
}

function DataTableFilter({
  column,
  placeholder = "All",
  className,
  renderValue,
}: DataTableFilterProps) {
  const { table } = useDataTableContext();
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const columnObj = table.getColumn(column);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!columnObj || !isMounted) return;

    // Use setTimeout to defer the computation to avoid side effects during render
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        try {
          const values = Array.from(columnObj.getFacetedUniqueValues().keys());
          setUniqueValues(values.sort().map(String));
        } catch (error) {
          console.warn("Error getting faceted unique values:", error);
          setUniqueValues([]);
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [columnObj, table.getRowModel().rows, isMounted]);

  if (!columnObj) {
    console.warn(`Column "${column}" not found in table`);
    return null;
  }

  const currentValue = columnObj.getFilterValue() as string | undefined;

  return (
    <Select
      value={currentValue || "all"}
      onValueChange={(value) => {
        columnObj.setFilterValue(value === "all" ? undefined : value);
      }}
    >
      <SelectTrigger className={className}>
        <Filter className="mr-2 h-4 w-4 text-muted-foreground/80" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {uniqueValues.map((value) => {
          const label = renderValue ? renderValue(value) : value;
          return (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

// Column visibility component
interface DataTableViewOptionsProps {
  className?: string;
}

function DataTableViewOptions({ className }: DataTableViewOptionsProps) {
  const { table } = useDataTableContext();

  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  if (hideableColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Columns3 className="mr-2 h-4 w-4 text-muted-foreground/80" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
  );
}

// Clear filters component
interface DataTableClearFiltersProps {
  className?: string;
}

function DataTableClearFilters({ className }: DataTableClearFiltersProps) {
  const { table } = useDataTableContext();

  const hasActiveFilters = table.getState().columnFilters.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => table.resetColumnFilters()}
    >
      <CircleX className="mr-2 h-4 w-4 text-muted-foreground/80" />
      Clear Filters
    </Button>
  );
}

// Selected Delete Button
interface DataTableDeleteSelectedProps {
  onDeleteSelected?: (ids: number[]) => void;
  isDeletingSelected: boolean;
}

function DataTableDeleteSelected({
  onDeleteSelected,
  isDeletingSelected,
}: DataTableDeleteSelectedProps) {
  const { table } = useDataTableContext();
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedRows = table.getSelectedRowModel().rows;

  useEffect(() => {
    setSelectedRowsCount(selectedRows.length);
  }, [selectedRows.length]);

  if (selectedRowsCount === 0 || selectedRowsCount < 2) return null;

  const handleConfirmDelete = async () => {
    if (!onDeleteSelected) return;
    const ids = selectedRows.map((row) => (row.original as any).id);
    await onDeleteSelected(ids);
    table.resetRowSelection(); 
    setIsDialogOpen(false);
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button className="bg-transparent" variant="outline">
          <TrashIcon
            className="-ms-1 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Delete
          <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
            {selectedRowsCount}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedRowsCount} selected{" "}
              {selectedRowsCount === 1 ? "row" : "rows"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingSelected}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeletingSelected}
          >
            {isDeletingSelected ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Pagination component
function DataTablePagination() {
  const { table } = useDataTableContext();

  return (
    <div className="flex flex-wrap items-center justify-between px-2 gap-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:gap-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex">
          <div className="flex mr-4 items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main compound component
export const DataTable = Object.assign(DataTableProvider, {
  Content: DataTableContent,
  Search: DataTableSearch,
  Filter: DataTableFilter,
  ViewOptions: DataTableViewOptions,
  Pagination: DataTablePagination,
  DeleteSelected: DataTableDeleteSelected,
  ClearFilters: DataTableClearFilters,
});
