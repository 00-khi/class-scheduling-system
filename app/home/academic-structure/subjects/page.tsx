import { MainSection } from "@/ui/components/main-section";
import SubjectManager from "./subject-manager";

export default function SubjectsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Subjects</MainSection.Title>
        <MainSection.Content>
          <SubjectManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
