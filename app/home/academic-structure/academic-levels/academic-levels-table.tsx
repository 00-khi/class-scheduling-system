"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  handleAddEntity,
  handleDeleteSelectedEntities,
} from "@/lib/crud-handler";
import { cn } from "@/lib/shadcn/utils";
import { DataTable } from "@/ui/components/data-table";
import {
  getActionsColumn,
  getSelectColumn,
} from "@/ui/components/data-table-columns";
import {
  DataTableSection,
  DataTableSkeleton,
  DataTableToolbar,
  DataTableToolbarGroup,
} from "@/ui/components/data-table-components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/shadcn/alert-dialog";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { Card } from "@/ui/shadcn/card";
import { Checkbox } from "@/ui/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/shadcn/dropdown-menu";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/shadcn/table";
import { AcademicLevel } from "@prisma/client";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  CircleAlertIcon,
  CircleX,
  Columns3,
  EditIcon,
  PlusIcon,
  Search,
  TrashIcon,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type AcademicLevelRow = AcademicLevel & {
  _count?: {
    courses: number;
  };
};

export default function AcademicLevelCards() {
  // TABLE STATES
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);

  // FORM DATA
  const [formData, setFormData] = useState<{
    id?: number;
    code?: string;
    name?: string;
    yearStart?: number;
    numberOfYears?: number;
  } | null>(null);

  const academicLevelApi = createApiClient<AcademicLevel>(
    "/api/academic-levels"
  );

  const entityManagement = useManageEntities<AcademicLevel>({
    apiService: { fetch: academicLevelApi.getAll },
  });

  const validate = (data: typeof formData, requireId = false): boolean => {
    if (requireId && !data?.id) {
      toast.error("Invalid ID");
      return false;
    }

    if (!data?.code) {
      toast.error(`Academic Level Code is required.`);
      return false;
    }

    if (!data?.name) {
      toast.error(`Academic Level Name is required.`);
      return false;
    }

    if (!data?.yearStart) {
      toast.error(`Starting Year is required.`);
      return false;
    }

    if (!data?.numberOfYears) {
      toast.error(`Number of Years is required.`);
      return false;
    }

    return true;
  };

  const columns: ColumnDef<AcademicLevelRow>[] = [
    {
      id: "select",
      header({ table }) {
        return (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
            onClick={() => prepareEditForm(row.original)}
          >
            <EditIcon size={16} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => prepareDeleteForm(row.original)}
          >
            <TrashIcon size={16} />
          </Button>
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: entityManagement.data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      // search across name, code
      const search = String(filterValue).toLowerCase();
      const valuesToSearch = [
        String(row.original.name ?? "").toLowerCase(),
        String(row.original.code ?? "").toLowerCase(),
      ];
      return valuesToSearch.some((val) => val.includes(search));
    },
  });

  const hideableColumns = table
    .getAllLeafColumns()
    .filter((col) => col.getCanHide());

  // Get selected row IDs
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);
  useEffect(() => {
    setSelectedRowsCount(selectedRows.length);
  }, [selectedRows.length]);

  const prepareAddForm = () => {
    setFormData(null);

    entityManagement.setIsFormDialogOpen(true);
  };

  const prepareEditForm = (item: AcademicLevelRow) => {
    setFormData(null);
    setFormData({
      id: item.id,
      code: item.code,
      name: item.name,
      yearStart: item.yearStart,
      numberOfYears: item.numberOfYears,
    });

    entityManagement.setIsFormDialogOpen(true);
  };

  const prepareDeleteForm = (item: AcademicLevelRow) => {
    setFormData(null);
    setFormData({
      id: item.id,
      name: item.name,
    });

    entityManagement.setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!formData?.id) {
      toast.error(`Error deleting ${formData?.name ?? "item"}: Invalid ID`);
      entityManagement.setIsDeleteDialogOpen(false);
      return;
    }

    entityManagement.setIsDeleting(true);
    try {
      const response = await fetch(`/api/academic-levels/${formData.id}`, {
        method: "DELETE",
      });

      if (response.status === 404) {
        throw new Error("Item not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error ?? "Response Error: Failed to delete item.";
        throw new Error(msg);
      }

      toast.success(`${formData.name ?? "Item"} deleted successfully`);
      entityManagement.fetchData();
      entityManagement.setIsDeleteDialogOpen(false);
      setFormData(null); // reset form data after delete
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error(`Error deleting item:`, error);
    } finally {
      entityManagement.setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    entityManagement.setIsDeletingSelected(true);

    try {
      const deletePromises = selectedIds.map((id) =>
        fetch(`/api/academic-levels/${id}`, { method: "DELETE" }).then(
          async (res) => {
            if (res.status === 404) throw new Error("Item not found");
            const data = await res.json();
            if (!res.ok)
              throw new Error(data?.error ?? "Failed to delete item");
            return true;
          }
        )
      );

      const results = await Promise.allSettled(deletePromises);

      const successfulDeletions = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      const failedDeletions = results.filter(
        (r) => r.status === "rejected"
      ).length;

      if (successfulDeletions > 0) {
        toast.success(`${successfulDeletions} item(s) deleted successfully`);
      }

      if (failedDeletions > 0) {
        const failedReasons = results
          .filter((r) => r.status === "rejected")
          .map((r) => (r as PromiseRejectedResult).reason.message);

        entityManagement.setFailedReasons(failedReasons);
        entityManagement.setFailedCount(failedDeletions);
        entityManagement.setFailedDialogOpen(true);
      }

      entityManagement.fetchData();
      table.resetRowSelection();
      entityManagement.setIsDeleteSelectedDialogOpen(false);
    } catch (err) {
      console.error("Error deleting items:", err);
      toast.error("Unexpected error occurred");
    } finally {
      entityManagement.setIsDeletingSelected(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData) {
      toast.error("All fields are required");
      return;
    }

    const isUpdate = Boolean(formData.id);
    const url = isUpdate
      ? `/api/academic-levels/${formData.id}`
      : "/api/academic-levels";

    if (!validate(formData, isUpdate)) return false;

    entityManagement.setIsSubmitting(true);

    try {
      const response = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Response error");
      }

      toast.success(
        isUpdate ? "Academic level updated" : "Academic level added"
      );

      entityManagement.fetchData();
      entityManagement.setIsFormDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      toast.error(msg);
      console.error("Error saving academic level:", err);
      return false;
    } finally {
      entityManagement.setIsSubmitting(false);
    }
  };

  return (
    <DataTableSection>
      {entityManagement.isLoading ? (
        <DataTableSkeleton columnCount={4} rowCount={5} />
      ) : (
        <DataTableSection>
          <DataTableToolbar>
            <DataTableToolbarGroup className="transition-all duration-300 ease-in-out">
              {/* SEARCH INPUT */}
              <div className="relative">
                <Input
                  className={cn("pl-9", globalFilter && "pr-9")}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search..."
                  type="text"
                />
                <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 pointer-events-none text-muted-foreground/80">
                  <Search size={16} />
                </div>
              </div>

              {/* FILTER OPTIONS */}
              <Select
                value={
                  (table.getColumn("code")?.getFilterValue() as string) ?? ""
                }
                onValueChange={(value) =>
                  table.getColumn("code")?.setFilterValue(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter Code" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {Array.from(
                    new Set(entityManagement.data.map((item) => item.code))
                  ).map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* CLEAR FILTERS BUTTON */}
              {(globalFilter || table.getState().columnFilters.length > 0) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setGlobalFilter("");
                    table.resetColumnFilters();
                  }}
                  className="ml-2"
                >
                  <CircleX />
                  Clear Filters
                </Button>
              )}

              {/* VIEW OPTIONS */}
              {hideableColumns.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Columns3 />
                      View
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {hideableColumns.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {typeof column.columnDef.header === "string"
                          ? column.columnDef.header
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </DataTableToolbarGroup>
            <DataTableToolbarGroup>
              {/* DELETE DIALOG */}
              {selectedRowsCount > 1 && (
                <AlertDialog
                  open={entityManagement.isDeleteSelectedDialogOpen}
                  onOpenChange={entityManagement.setIsDeleteSelectedDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    {/* DELETE BUTTON */}
                    <Button className="bg-transparent" variant="outline">
                      <TrashIcon />
                      Delete
                      {/* <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"> */}
                      <span>{selectedRowsCount}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                      >
                        <CircleAlertIcon />
                      </div>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete {selectedRowsCount} selected{" "}
                          {selectedRowsCount === 1 ? "row" : "rows"}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        disabled={entityManagement.isDeletingSelected}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteSelected}
                        disabled={entityManagement.isDeletingSelected}
                      >
                        {entityManagement.isDeletingSelected
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button onClick={prepareAddForm}>
                <PlusIcon />
                Add Academic Level
              </Button>
            </DataTableToolbarGroup>
          </DataTableToolbar>

          {/* TABLE */}
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
                            tabIndex={
                              header.column.getCanSort() ? 0 : undefined
                            }
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
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

          {/* PAGINATION */}
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
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
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
        </DataTableSection>
      )}

      {/* FORM DIALOG */}
      <Dialog
        open={entityManagement.isFormDialogOpen}
        onOpenChange={(open) => {
          if (entityManagement.isSubmitting) return;
          if (!open) {
            entityManagement.setIsFormDialogOpen(false);
            setFormData(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData?.id ? "Edit" : "Add"} Academic Level
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* ACADEMIC LEVEL CODE INPUT */}
            <div className="space-y-2">
              <Label htmlFor="code">Academic Level Code</Label>
              <Input
                id="code"
                value={formData?.code ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., TER, SHS, JHS"
                disabled={entityManagement.isSubmitting}
              />
            </div>
            {/* ACADEMIC LEVEL NAME INPUT */}
            <div className="space-y-2">
              <Label htmlFor="name">Academic Level Name</Label>
              <Input
                id="name"
                value={formData?.name ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Tertiary, Senior High School, Junior High School"
                disabled={entityManagement.isSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* YEAR START INPUT */}
              <div className="space-y-2">
                <Label htmlFor="name">Year Start</Label>
                <Input
                  id="yearStart"
                  value={formData?.yearStart ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearStart: Number(e.target.value),
                    })
                  }
                  placeholder="Enter year start..."
                  disabled={entityManagement.isSubmitting}
                />
              </div>
              {/* NUMBER OF YEARS INPUT */}
              <div className="space-y-2">
                <Label htmlFor="name">Number of Years</Label>
                <Input
                  id="numberOfYears"
                  value={formData?.numberOfYears ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfYears: Number(e.target.value),
                    })
                  }
                  placeholder="Enter number of years..."
                  disabled={entityManagement.isSubmitting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => entityManagement.setIsFormDialogOpen(false)}
                disabled={entityManagement.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={entityManagement.isSubmitting}>
                {entityManagement.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={entityManagement.isDeleteDialogOpen}>
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
                This action cannot be undone.
                {formData?.name && (
                  <span className="font-semibold">{formData.name}</span>
                )}
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={entityManagement.isDeleting}
              onClick={() => entityManagement.setIsDeleteDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <Button // Use a standard Button component here
              variant="destructive"
              onClick={handleDelete}
              disabled={entityManagement.isDeleting}
            >
              {entityManagement.isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FAILED DELETE DIALOG */}
      <AlertDialog
        open={entityManagement.failedDialogOpen}
        onOpenChange={() => entityManagement.setFailedDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Failed to delete {entityManagement.failedCount} item(s)
            </AlertDialogTitle>
            <AlertDialogDescription>
              Some deletions could not be completed. Reasons:
            </AlertDialogDescription>
            <AlertDialogDescription className="text-destructive">
              {entityManagement.failedReasons.map((error, idx) => (
                <div key={idx}>{`- ${error}`}</div>
              ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => entityManagement.setFailedDialogOpen(false)}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DataTableSection>
  );
}
