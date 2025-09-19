import { MainSection } from "@/ui/components/main-section";
import InstructorManager from "./instructor-manager";

export default function ManageInstructorsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Manage Instructors</MainSection.Title>
        <MainSection.Content>
          <InstructorManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
