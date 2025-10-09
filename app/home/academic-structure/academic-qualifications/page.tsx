import { MainSection } from "@/ui/components/main-section";
import AcademicQualificationManager from "./academic-qualification-manager";

export default function AcademicQualificationsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Academic Qualifications</MainSection.Title>
          <MainSection.Description>
            Create and manage academic qualifications.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <AcademicQualificationManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
