"use client";

import * as React from "react";
import {
  LayoutDashboard,
  LogOut,
  School,
  WandSparkles,
  ClockPlus,
  UserPen,
  Ticket,
  NotebookPen,
  Sparkles,
  Settings,
  NotebookText,
  Grid2X2Plus,
  BarChart3,
  Users,
  BookOpen,
  Building,
  GraduationCap,
  Calendar,
  CalendarDays,
  Zap,
  Megaphone,
  MapPin,
} from "lucide-react";

import { NavGroup } from "./nav-group";
import { Sidebar, SidebarContent } from "@/shadcn/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navGroup: [
      {
        category: "MAIN",
        items: [
          {
            title: "Dashboard",
            url: "/home/main/dashboard",
            icon: LayoutDashboard,
          },
          {
            title: "Schedules",
            url: "/home/main/schedules",
            icon: BarChart3,
          },
        ],
      },
      {
        category: "ACADEMIC STRUCTURE",
        items: [
          {
            title: "Academic Qualifications",
            url: "/home/academic-structure/academic-qualifications",
            icon: Building,
          },
          {
            title: "Academic Levels",
            url: "/home/academic-structure/academic-levels",
            icon: GraduationCap,
          },
          {
            title: "Courses",
            url: "/home/academic-structure/courses",
            icon: School,
          },
          {
            title: "Subjects",
            url: "/home/academic-structure/subjects",
            icon: BookOpen,
          },
          {
            title: "Rooms",
            url: "/home/academic-structure/rooms",
            icon: MapPin,
          },
        ],
      },
      {
        category: "MANAGEMENT",
        items: [
          {
            title: "Manage Instructors",
            url: "/home/management/manage-instructors",
            icon: Users,
          },
          {
            title: "Manage Sections",
            url: "/home/management/manage-sections",
            icon: GraduationCap,
          },
        ],
      },
      {
        category: "ASSIGNMENT",
        items: [
          {
            title: "Subject Assigning",
            url: "/home/assignment/subject-assigning",
            icon: NotebookText,
          },
          // {
          //   title: "Auto Assign Instructor",
          //   url: "/home/assignment/auto-assign-instructor",
          //   icon: Zap,
          // },
          {
            title: "Exam Assigning",
            url: "/home/assignment/exam-assigning",
            icon: Ticket,
          },
        ],
      },
      {
        category: "SCHEDULING",
        items: [
          {
            title: "Subject Scheduling",
            url: "/home/scheduling/subject-scheduling",
            icon: CalendarDays,
          },
          {
            title: "Instructor Scheduling",
            url: "/home/scheduling/instructor-scheduling",
            icon: Calendar,
          },
          {
            title: "Auto Class Scheduling",
            url: "/home/scheduling/auto-class-scheduling",
            icon: Zap,
          },
          {
            title: "Custom Scheduling",
            url: "/home/scheduling/custom-scheduling",
            icon: Sparkles,
          },
        ],
      },
      // {
      //   category: "ANNOUNCEMENT",
      //   items: [
      //     {
      //       title: "Post News / Events",
      //       url: "/home/announcement/post-news-events",
      //       icon: Megaphone,
      //     },
      //     // my idea here is to post events/news/etc...
      //     // for example, i want to send an event notif, i can write when and where
      //     // hirap mag english
      //     // then makikita ng teachers or kung sino mn pumunta sa website
      //   ],
      // },
      {
        category: "SYSTEM",
        items: [
          {
            title: "Settings",
            url: "/home/system/settings",
            icon: Settings,
          },
        ],
      },
    ],
  };

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavGroup data={data.navGroup} />
      </SidebarContent>
    </Sidebar>
  );
}
