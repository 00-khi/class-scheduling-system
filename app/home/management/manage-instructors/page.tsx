import { MainSection } from "@/ui/components/main-section";
import InstructorManager from "./instructor-manager";

export default function ManageInstructorsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Manage Instructors</MainSection.Title>
          <MainSection.Description>
            Create and manage instructor information.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <InstructorManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
