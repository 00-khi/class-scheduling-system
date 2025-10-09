"use client";

import { MainSection } from "@/ui/components/main-section";
import { useState } from "react";
import UnassignedSubjectManager from "./unassigned-subject-manager";

export default function InstructorSchedulingPage() {
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    number | null
  >(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Instructor Scheduling</MainSection.Title>
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
    </MainSection>
  );
}
