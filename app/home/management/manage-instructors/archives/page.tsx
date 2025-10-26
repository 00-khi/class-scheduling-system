import { MainSection } from "@/ui/components/main-section";
import InstructorManager from "./archived-instructor-manager";

export default function ManageInstructorsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Archived Instructors</MainSection.Title>
          <MainSection.Description>
            Manage archived instructor information.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <InstructorManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
