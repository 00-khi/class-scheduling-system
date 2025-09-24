import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Label } from "@/ui/shadcn/label";
import { Separator } from "@/ui/shadcn/separator";
import { Skeleton } from "@/ui/shadcn/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground font-normal">
              <Skeleton className="h-4 w-48 bg-muted" />
            </CardTitle>
          </CardHeader>
          <CardContent className="border-y py-4 space-y-4 h-full">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-26 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
            </div>
            <Skeleton className="h-10 w-32 bg-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground font-normal">
              <Skeleton className="h-4 w-48 bg-muted" />
            </CardTitle>
          </CardHeader>
          <CardContent className="border-y py-4 space-y-4 h-full">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-26 bg-muted" />
                <Skeleton className="h-10 w-full bg-muted" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-26 bg-muted" />
                <Skeleton className="h-10 w-full bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-26 bg-muted" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 bg-muted" />
                    <Skeleton className="h-4 w-16 bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-row sm:justify-between items-center gap-2">
        <div className="w-full hidden sm:block">
          <Separator />
        </div>
        <Skeleton className="h-10 w-64 bg-muted" />
      </div>
    </div>
  );
}
