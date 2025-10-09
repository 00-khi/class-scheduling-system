"use client";

import { useState } from "react";
import { MainSection } from "@/ui/components/main-section";
import SelectSectionGroup from "../../../../ui/components/select-section-group";
import UnscheduledSubjectsManager from "./unscheduled-subject-manager";
import ScheduledSubjectManager from "./scheduled-subject-manager";
import { Card } from "@/ui/shadcn/card";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/ui/shadcn/separator";
import TimetableManager from "./timetable-manager";

export default function SubjectSchedulingPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Subject Scheduling</MainSection.Title>
          <MainSection.Description>
            Create and manage subject-based schedules.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <SelectSectionGroup onSectionChange={setSelectedSectionId} />
        </MainSection.Content>

        <MainSection.Content>
          {!selectedSectionId ? (
            <Card>
              <div className="flex flex-col justify-center items-center gap-2 text-muted-foreground">
                <ArrowRight size={32} />
                <span className="text-sm">
                  Select a section to start scheduling subjects
                </span>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              <UnscheduledSubjectsManager
                sectionId={selectedSectionId}
                onChange={triggerRefresh}
                refreshKey={refreshKey}
              />
            </div>
          )}
        </MainSection.Content>
      </MainSection.Section>

      {selectedSectionId && (
        <>
          <Separator />

          <MainSection.Section>
            <MainSection.ContentTitle>
              Scheduled Subjects
            </MainSection.ContentTitle>
            <MainSection.Content>
              <div className="space-y-6">
                <ScheduledSubjectManager
                  sectionId={selectedSectionId}
                  onChange={triggerRefresh}
                  refreshKey={refreshKey}
                />

                {/* <TimetableManager
                  sectionId={selectedSectionId}
                  refreshKey={refreshKey}
                /> */}
              </div>
            </MainSection.Content>
          </MainSection.Section>
        </>
      )}
    </MainSection>
  );
}
