import { MainSection } from "@/ui/components/main-section";
import SubjectsTable from "./subjects-table";

export default function SubjectsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Subjects</MainSection.Title>
        <MainSection.Content>
          <SubjectsTable />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
