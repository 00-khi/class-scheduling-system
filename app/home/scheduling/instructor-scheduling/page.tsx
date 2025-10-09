"use client";

import { MainSection } from "@/ui/components/main-section";
import { useState } from "react";
import UnassignedSubjectManager from "./unassigned-subject-manager";
import { Separator } from "@/ui/shadcn/separator";
import { Card } from "@/ui/shadcn/card";

export default function InstructorSchedulingPage() {
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    number | null
  >(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Instructor Scheduling</MainSection.Title>
          <MainSection.Description>
            Assign instructor teaching schedules.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <div className="space-y-3">
            {/* <SelectInstructorGroup /> */}

            <UnassignedSubjectManager
              onChange={triggerRefresh}
              refreshKey={refreshKey}
            />

            {/* TO DO: AssignedSubjectManager */}
          </div>
        </MainSection.Content>
      </MainSection.Section>
      <Separator />
      <MainSection.Section>
        <MainSection.ContentTitle>Assigned Subjects</MainSection.ContentTitle>
        <MainSection.Content>
          Add the AssignedSubjectManager component here
          {/* <UnassignedSubjectManager
            onChange={triggerRefresh}
            refreshKey={refreshKey}
          /> */}
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
