import { getInstructorCount } from "@/services/instructorService";
import { getRoomCount } from "@/services/roomService";
import { getSectionCount } from "@/services/sectionService";
import { getSubjectCount } from "@/services/subjectService";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import { stat } from "fs";
import {
  BookOpen,
  Building,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";
import { title } from "process";

export default function InfoCardWrapper() {
  const sectionCount = getSectionCount();
  const instructorCount = getInstructorCount();
  const subjectCount = getSubjectCount();
  const roomCount = getRoomCount();

  const stats = [
    {
      title: "Sections",
      value: sectionCount,
      icon: GraduationCap,
    },
    {
      title: "Instructors",
      value: instructorCount,
      icon: Users,
    },
    {
      title: "Subjects",
      value: subjectCount,
      icon: BookOpen,
    },
    {
      title: "Rooms",
      value: roomCount,
      icon: Building,
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <InfoCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </>
  );
}

function InfoCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
}) {
  const Icon = icon;

  return (
    // <Card className="from-primary/5 to-card bg-gradient-to-t">
    <Card>
      <CardHeader>
        <CardDescription className="text-card-foreground">
          {title}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <CardAction>
          <Icon size={16} />
        </CardAction>
      </CardHeader>
    </Card>
  );
}
