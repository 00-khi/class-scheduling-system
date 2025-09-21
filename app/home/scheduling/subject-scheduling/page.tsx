"use client";

import { MainSection } from "@/ui/components/main-section";
import SelectSectionCard from "../../../../ui/components/select-section-card";
import { useState } from "react";

export default function SubjectSchedulingPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>
          Subject Scheduling {selectedSectionId}
        </MainSection.Title>
        <MainSection.Content>
          <SelectSectionCard onSectionChange={setSelectedSectionId} />
        </MainSection.Content>
        <MainSection.Content>
          <SelectSectionCard />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
