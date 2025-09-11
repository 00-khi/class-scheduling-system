"use client";

// import { getInstructorCount } from "@/services/instructorService";
// import { getRoomCount } from "@/services/roomService";
// import { getSectionCount } from "@/services/sectionService";
// import { getSubjectCount } from "@/services/subjectService";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/shadcn/card";
import {
  BookOpen,
  Building,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

export function InfoCardWrapper() {
  const [stats, setStats] = useState([
    { label: "Sections", value: "--", icon: GraduationCap },
    { label: "Instructors", value: "--", icon: Users },
    { label: "Subjects", value: "--", icon: BookOpen },
    { label: "Rooms", value: "--", icon: Building },
  ]);

  // const refreshStats = () => {
  //   setStats([
  //     { label: "Sections", value: 0, icon: GraduationCap },
  //     { label: "Instructors", value: 0, icon: Users },
  //     { label: "Subjects", value: 0, icon: BookOpen },
  //     { label: "Rooms", value: 0, icon: Building },
  //   ]);
  // };

  // useEffect(() => {
  //   refreshStats();
  // }, []);

  return (
    <>
      {stats.map((stat) => (
        <InfoCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  const Icon = icon;

  return (
    <Card>
      <CardHeader>
        <CardDescription className="text-card-foreground">
          {label}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <CardAction>
          <Icon size={16} />
        </CardAction>
      </CardHeader>
    </Card>
  );
}
