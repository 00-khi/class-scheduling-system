import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { CourseRow, TableState } from "../course-manager";
import { ColumnDef } from "@tanstack/react-table";

export function useCourseTable(
  data: CourseRow[],
  columns: ColumnDef<CourseRow>[],
  tableState: TableState,
  setTableState: Dispatch<SetStateAction<TableState>>
) {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: tableState.sorting,
      pagination: tableState.pagination,
      columnFilters: tableState.columnFilters,
      columnVisibility: tableState.columnVisibility,
      globalFilter: tableState.globalFilter,
    },
    onSortingChange: (sorting) =>
      setTableState((prev) => ({
        ...prev,
        sorting:
          typeof sorting === "function" ? sorting(prev.sorting) : sorting,
      })),
    onColumnFiltersChange: (columnFilters) =>
      setTableState((prev) => ({
        ...prev,
        columnFilters:
          typeof columnFilters === "function"
            ? columnFilters(prev.columnFilters)
            : columnFilters,
      })),
    onColumnVisibilityChange: (columnVisibility) =>
      setTableState((prev) => ({
        ...prev,
        columnVisibility:
          typeof columnVisibility === "function"
            ? columnVisibility(prev.columnVisibility)
            : columnVisibility,
      })),
    onGlobalFilterChange: (globalFilter) =>
      setTableState((prev) => ({ ...prev, globalFilter })),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const valuesToSearch = [
        String(row.original.name ?? "").toLowerCase(),
        String(row.original.code ?? "").toLowerCase(),
        String(row.original.academicLevel?.code ?? "").toLowerCase(),
      ];
      return valuesToSearch.some((val) => val.includes(search));
    },
  });

  return table;
}
