import { MainSection } from "@/ui/components/main-section";
import AcademicLevelManager from "./academic-level-manager";

export default function AcademicLevelsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Academic Levels</MainSection.Title>
          <MainSection.Description>
            Create and manage academic levels and their year levels.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <AcademicLevelManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
