import { MainSection } from "@/ui/components/main-section";
import InstructorSchedulingClient from "@/ui/pages/scheduling/instructor-scheduling/instructor-scheduling-client";

export default function InstructorAssigning() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Instructor Assigning</MainSection.Title>
        <MainSection.Content>
          <InstructorSchedulingClient />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
