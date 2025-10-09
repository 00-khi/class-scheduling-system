import { MainSection } from "@/ui/components/main-section";
import CourseManager from "./course-manager";

export default function CoursesPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Courses</MainSection.Title>
          <MainSection.Description>
            Create and manage academic courses.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <CourseManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
