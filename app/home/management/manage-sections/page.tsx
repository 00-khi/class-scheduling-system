import { MainSection } from "@/ui/components/main-section";
import SectionsTable from "./sections-table";

export default function ManageSectionsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Manage Sections</MainSection.Title>
        <MainSection.Content>
          <SectionsTable />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
