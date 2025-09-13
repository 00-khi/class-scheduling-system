import { MainSection } from "@/ui/components/main-section";
import CoursesTable from "./courses-table";

export default function CoursesPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Courses</MainSection.Title>
        <MainSection.Content>
          <CoursesTable />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
