import { MainSection } from "@/ui/components/main-section";
import AcademicLevelsTable from "./academic-levels-table";
import AcademicLevelManager from "./academic-level-manager";

export default function AcademicLevelsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Academic Levels</MainSection.Title>
        <MainSection.Content>
          <AcademicLevelManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
