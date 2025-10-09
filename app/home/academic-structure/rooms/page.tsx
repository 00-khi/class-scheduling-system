import { MainSection } from "@/ui/components/main-section";
import RoomManager from "./room-manager";

export default function RoomsPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Rooms</MainSection.Title>
          <MainSection.Description>
            Create and manage lecture and laboratory rooms.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <RoomManager />
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
