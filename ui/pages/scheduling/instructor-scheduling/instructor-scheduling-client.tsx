"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shadcn/components/ui/card";
import SelectInstructor from "./select-instructor";
import UnassignedInstructorSubjectsTable from "./unassigned-instructor-subjects-table";
import AssignedInstructorSubjectsTable from "./assigned-instructor-subjects-table";

export default function InstructorSchedulingClient() {
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((p) => p + 1);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Select Instructor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SelectInstructor onInstructorChange={setSelectedInstructor} />
        </CardContent>
      </Card>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Available Schedules
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[70vh] max-h-[70vh] overflow-y-auto py-4 border-y">
            <UnassignedInstructorSubjectsTable
              selectedInstructor={selectedInstructor}
              onChange={triggerRefresh}
              refreshKey={refreshKey}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Instructor Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[70vh] max-h-[70vh] overflow-y-auto py-4 border-y">
            <AssignedInstructorSubjectsTable
              selectedInstructor={selectedInstructor}
              onChange={triggerRefresh}
              refreshKey={refreshKey}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
