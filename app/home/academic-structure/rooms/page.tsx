import { MainSection } from "@/ui/components/main-section";
import RoomsTable from "./rooms-table";

export default function RoomsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Rooms</MainSection.Title>
        <MainSection.Content>
          <RoomsTable />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
