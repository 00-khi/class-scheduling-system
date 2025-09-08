import { MainSection } from "@/ui/components/main-section";
import AcademicQualificationsTable from "./academic-qualifications-table";

export default function AcademicQualifications() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Academic Qualifications</MainSection.Title>
        <MainSection.Content>
          <AcademicQualificationsTable />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
