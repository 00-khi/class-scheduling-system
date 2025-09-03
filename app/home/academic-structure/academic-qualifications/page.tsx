import AcademicQualificationsTable from "@/ui/pages/academic-structure/academic-qualifications/academic-qualifications-table";
import { MainSection } from "@/ui/components/main-section";

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
