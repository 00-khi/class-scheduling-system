"use client";

import { InfoCardWrapper } from "./cards";
import { Separator } from "@/ui/shadcn/separator";
import { MainSection } from "@/ui/components/main-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Button } from "@/ui/shadcn/button";
import { FileSpreadsheet } from "lucide-react";
import SelectSectionGroup from "@/ui/components/select-section-group";
import { useState } from "react";
import SectionTimetable from "./section-timetable";
import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  SCHEDULED_INSTRUCTORS_API,
  SCHEDULED_SUBJECTS_API,
} from "@/lib/api/api-endpoints";
import { ScheduledSubject } from "@prisma/client";
import {
  exportInstructorSchedule,
  exportRoomSchedule,
  exportSectionSchedule,
} from "@/lib/export-functions";
import { toast } from "sonner";
import SelectRoomGroup from "@/ui/components/select-room-group";
import SelectInstructorGroup from "@/ui/components/select-instructor-group";

export default function DashboardPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    number | null
  >(null);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  async function handleCsvExport(type: "section" | "room" | "instructor") {
    if (type === "section") {
      setIsExportingCsv(true);

      try {
        const response = await fetch(SCHEDULED_SUBJECTS_API, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Response error");
        }

        exportSectionSchedule(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        toast.error(message);
        console.error("Error saving section:", err);
      }

      setIsExportingCsv(false);
    }

    if (type === "room") {
      setIsExportingCsv(true);

      try {
        const response = await fetch(SCHEDULED_SUBJECTS_API, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Response error");
        }

        exportRoomSchedule(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        toast.error(message);
        console.error("Error saving section:", err);
      }

      setIsExportingCsv(false);
    }

    if (type === "instructor") {
      setIsExportingCsv(true);

      try {
        const response = await fetch(SCHEDULED_INSTRUCTORS_API, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Response error");
        }

        exportInstructorSchedule(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        toast.error(message);
        console.error("Error saving section:", err);
      }

      setIsExportingCsv(false);
    }
  }

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Dashboard</MainSection.Title>
          <MainSection.Description>
            Overview of scheduling system.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <InfoCardWrapper />
          </div>
        </MainSection.Content>
      </MainSection.Section>

      <Separator />

      <MainSection.Section>
        <MainSection.ContentTitle>Schedules</MainSection.ContentTitle>

        <MainSection.Content>
          <Tabs defaultValue="section">
            <TabsList>
              <TabsTrigger value="section">Section</TabsTrigger>
              <TabsTrigger value="room">Room</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>
            <TabsContent value="section" className="space-y-3">
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Filter by Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SelectSectionGroup
                    selectedSectionId={selectedSectionId}
                    onSectionChange={setSelectedSectionId}
                  />
                  <Button
                    disabled={isExportingCsv}
                    onClick={() => handleCsvExport("section")}
                  >
                    <FileSpreadsheet />
                    Export to CSV
                  </Button>
                </CardContent>
              </Card>

              {selectedSectionId && (
                <SectionTimetable
                  sectionId={selectedSectionId}
                  refreshKey={0}
                />
              )}
            </TabsContent>
            <TabsContent value="room">
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Filter by Room
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SelectRoomGroup
                    selectedRoomId={selectedRoomId}
                    onRoomChange={setSelectedRoomId}
                  />
                  <Button
                    disabled={isExportingCsv}
                    onClick={() => handleCsvExport("room")}
                  >
                    <FileSpreadsheet />
                    Export to CSV
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="instructor">
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Filter by Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SelectInstructorGroup
                    selectedInstructorId={selectedInstructorId}
                    onInstructorChange={setSelectedInstructorId}
                  />
                  <Button
                    disabled={isExportingCsv}
                    onClick={() => handleCsvExport("instructor")}
                  >
                    <FileSpreadsheet />
                    Export to CSV
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
