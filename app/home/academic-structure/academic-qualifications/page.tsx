import { MainSection } from "@/ui/components/main-section";
import AcademicQualificationsTable from "./academic-qualifications-table";
import AcademicQualificationManager from "./academic-qualification-manager";

export default function AcademicQualificationsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Academic Qualifications</MainSection.Title>
        <MainSection.Content>
          <AcademicQualificationManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
