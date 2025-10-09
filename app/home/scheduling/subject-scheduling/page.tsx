"use client";

import { MainSection } from "@/ui/components/main-section";
import SelectSectionGroup from "../../../../ui/components/select-section-group";
import { useState } from "react";
import UnscheduledSubjectsManager from "./unscheduled-subject-manager";
import { Card } from "@/ui/shadcn/card";
import { ArrowRight } from "lucide-react";
import ScheduledSubjectManager from "./scheduled-subject-manager";
import Timetable from "./components/timetable";
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
        <MainSection.Title>Subject Scheduling</MainSection.Title>
        <MainSection.Content>
          <div className="space-y-3">
            <SelectSectionGroup onSectionChange={setSelectedSectionId} />

            {selectedSectionId ? (
              <div className="space-y-3">
                <UnscheduledSubjectsManager
                  sectionId={selectedSectionId}
                  onChange={triggerRefresh}
                  refreshKey={refreshKey}
                />
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
            ) : (
              <Card>
                <div className="flex flex-col justify-center items-center gap-2 text-muted-foreground">
                  <ArrowRight size={32} />
                  <span className=" text-sm">
                    Select a section to start scheduling subjects
                  </span>
                </div>
              </Card>
            )}
          </div>
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
