"use client";

import { useEffect, useState } from "react";
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
import {
  INSTRUCTORS_COUNT_API,
  ROOMS_COUNT_API,
  SECTIONS_COUNT_API,
  SUBJECTS_COUNT_API,
} from "@/lib/api/api-endpoints";

export function InfoCardWrapper() {
  const [stats, setStats] = useState([
    {
      label: "Sections",
      value: 0,
      target: 0,
      icon: GraduationCap,
      api: SECTIONS_COUNT_API,
    },
    {
      label: "Instructors",
      value: 0,
      target: 0,
      icon: Users,
      api: INSTRUCTORS_COUNT_API,
    },
    {
      label: "Subjects",
      value: 0,
      target: 0,
      icon: BookOpen,
      api: SUBJECTS_COUNT_API,
    },
    {
      label: "Rooms",
      value: 0,
      target: 0,
      icon: Building,
      api: ROOMS_COUNT_API,
    },
  ]);

  useEffect(() => {
    async function fetchCounts() {
      const updated = await Promise.all(
        stats.map(async (stat) => {
          try {
            const res = await fetch(stat.api);
            const data = await res.json();
            return { ...stat, target: data.count || 0 };
          } catch {
            return { ...stat, target: 0 };
          }
        })
      );
      setStats(updated);
    }

    fetchCounts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((s) => {
          if (s.value < s.target) {
            const diff = s.target - s.value;
            const step = diff > 10 ? Math.ceil(diff / 10) : 1;
            return { ...s, value: s.value + step };
          }
          return s;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [stats]);

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
