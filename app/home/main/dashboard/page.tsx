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

export default function DashboardPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );

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
      {/* TEST */}

      {/* <MainSection.Section>
        <MainSection.Title>Today's Class Schedule</MainSection.Title>
        <MainSection.Content>
          <Card className="h-[600px]">
            <CardHeader>
              <CardDescription>Heh</CardDescription>
            </CardHeader>
          </Card>
        </MainSection.Content>
      </MainSection.Section> */}

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
                  <Button>
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
