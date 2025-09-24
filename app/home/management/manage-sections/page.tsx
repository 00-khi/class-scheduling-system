import { MainSection } from "@/ui/components/main-section";
import SectionManager from "./section-manager";

export default function ManageSectionsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Manage Sections</MainSection.Title>
        <MainSection.Content>
          <SectionManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
