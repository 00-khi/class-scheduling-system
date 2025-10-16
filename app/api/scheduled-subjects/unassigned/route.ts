import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { toMinutes } from "@/lib/schedule-utils";
import { Day, Semester } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  const DAYS_ORDER = Object.values(Day);

  // get current semester from settings
  const semesterSetting = await prisma.setting.findUnique({
    where: { key: "semester" },
  });
  if (!semesterSetting) {
    return NextResponse.json(
      { error: "Semester setting not found" },
      { status: 400 }
    );
  }
  const currentSemester = semesterSetting.value as Semester;

  const unassignedSubjects = await prisma.scheduledSubject.findMany({
    where: {
      scheduledInstructor: null,
      subject: {
        semester: {
          in: [currentSemester, "Whole_Semester"],
        },
      },
    },
    include: {
      room: true,
      subject: true,
      section: true,
    },
  });

  const sorted = unassignedSubjects.sort((a, b) => {
    const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  return NextResponse.json(sorted);
});
