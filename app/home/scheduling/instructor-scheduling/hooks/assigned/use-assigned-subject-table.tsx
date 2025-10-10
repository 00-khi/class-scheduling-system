import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ScheduledInstructorRow,
  TableState,
} from "../../assigned-subject-manager";

export function useAssignedSubjectTable(
  data: ScheduledInstructorRow[],
  columns: ColumnDef<ScheduledInstructorRow>[],
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
    onPaginationChange: (updater) =>
      setTableState((prev) => ({
        ...prev,
        pagination:
          typeof updater === "function" ? updater(prev.pagination) : updater,
      })),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const valuesToSearch = [
        String(row.original.instructor.name ?? "").toLowerCase(),
        String(row.original.scheduledSubject.section.name ?? "").toLowerCase(),
        String(row.original.scheduledSubject.subject.name ?? "").toLowerCase(),
        String(row.original.scheduledSubject.subject.code ?? "").toLowerCase(),
      ];
      return valuesToSearch.some((val) => val.includes(search));
    },
  });

  return table;
}
