import { MainSection } from "@/ui/components/main-section";
import InstructorsTable from "./instructors-table";

export default function ManageInstructors() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Manage Instructors</MainSection.Title>
        <MainSection.Content>
          <InstructorsTable />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
