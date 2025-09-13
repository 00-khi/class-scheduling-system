import { MainSection } from "@/ui/components/main-section";
import AcademicLevelsTable from "./academic-levels-table";

export default function AcademicLevelsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Academic Levels</MainSection.Title>
        <MainSection.Content>
          <AcademicLevelsTable />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
