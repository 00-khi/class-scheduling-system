import InfoCardWrapper from "@/ui/pages/main/dashboard/cards";
import { Separator } from "@/shadcn/components/ui/separator";
import { Card, CardDescription, CardHeader } from "@/shadcn/components/ui/card";
import { MainSection } from "@/ui/components/main-section";

//

export default function Dashboard() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Dashboard</MainSection.Title>
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
