import { Card } from "@/ui/shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/shadcn/table";
import { Skeleton } from "@/ui/shadcn/skeleton";

export function DataTableSkeleton({
  columnCount = 4,
  rowCount = 5,
}: {
  columnCount?: number;
  rowCount?: number;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-55 bg-muted border" />
          <Skeleton className="h-9 w-25 bg-muted border" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-55 bg-muted border" />
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-8 w-full bg-muted" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-5">
                    <Skeleton className="h-3 w-full bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

export function DataTableToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {children}
    </div>
  );
}

export function DataTableToolbarGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export function DataTableSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}
