import { MainSection } from "@/ui/components/main-section";
import SelectSectionGroup from "@/ui/components/select-section-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";

export default function SchedulesPage() {
  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Instructor Scheduling</MainSection.Title>
        <MainSection.Content>
          <Tabs defaultValue="section">
            <TabsList>
              <TabsTrigger value="section">Section</TabsTrigger>
              <TabsTrigger value="room">Room</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>
            <TabsContent value="section">
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Filter by Section
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SelectSectionGroup />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="room">
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Filter by Room
                  </CardTitle>
                </CardHeader>
                <CardContent>{/* selects */}</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="instructor">
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Filter by Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>{/* selects */}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
