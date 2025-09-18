import { MainSection } from "@/ui/components/main-section";
import CourseManager from "./course-manager";

export default function CoursesPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Courses</MainSection.Title>
        <MainSection.Content>
          <CourseManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
