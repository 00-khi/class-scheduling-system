"use client";

import { MainSection } from "@/ui/components/main-section";
import SelectSectionGroup from "@/ui/components/select-section-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";
import { useState } from "react";
import SectionTimetable from "./section-timetable";

export default function SchedulesPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Schedules</MainSection.Title>
          <MainSection.Description>
            Review and export section, room, and instructor schedules.
          </MainSection.Description>
        </MainSection.Content>

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
                <CardContent>
                  <SelectSectionGroup
                    selectedSectionId={selectedSectionId}
                    onSectionChange={setSelectedSectionId}
                  />
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
                <CardContent>{/* selects */}</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="instructor">
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Filter by Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>{/* selects */}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
