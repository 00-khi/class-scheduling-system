import { InfoCardWrapper } from "./cards";
import { Separator } from "@/ui/shadcn/separator";
import { MainSection } from "@/ui/components/main-section";

export default function DashboardPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Dashboard</MainSection.Title>
          <MainSection.Description>
            Overview of scheduling system.
          </MainSection.Description>
        </MainSection.Content>

        <MainSection.Content>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <InfoCardWrapper />
          </div>
        </MainSection.Content>
      </MainSection.Section>

      <Separator />
      {/* TEST */}

      {/* <MainSection.Section>
        <MainSection.Title>Today's Class Schedule</MainSection.Title>
        <MainSection.Content>
          <Card className="h-[600px]">
            <CardHeader>
              <CardDescription>Heh</CardDescription>
            </CardHeader>
          </Card>
        </MainSection.Content>
      </MainSection.Section> */}
    </MainSection>
  );
}
