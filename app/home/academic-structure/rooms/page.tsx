import { MainSection } from "@/ui/components/main-section";
import RoomManager from "./room-manager";

export default function RoomsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Rooms</MainSection.Title>
        <MainSection.Content>
          <RoomManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
