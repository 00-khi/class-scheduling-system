import { MainSection } from "@/ui/components/main-section";
import SectionManager from "./section-manager";

export default function ManageSectionsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Manage Sections</MainSection.Title>
          <MainSection.Description>
            Create and manage sections and their assigned courses.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <SectionManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
