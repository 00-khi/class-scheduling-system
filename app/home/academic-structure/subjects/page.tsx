import { MainSection } from "@/ui/components/main-section";
import SubjectManager from "./subject-manager";

export default function SubjectsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Subjects</MainSection.Title>
          <MainSection.Description>
            Create and manage subject information for courses.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <SubjectManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
