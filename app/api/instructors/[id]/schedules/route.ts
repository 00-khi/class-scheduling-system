import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { toMinutes } from "@/lib/schedule-utils";
import { Day, Semester } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const DAYS_ORDER = Object.values(Day);

  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid instructor ID." },
      { status: 400 }
    );
  }

  // get current semester from settings
  const semesterSetting = await prisma.setting.findUnique({
    where: { key: "semester" },
  });
  if (!semesterSetting) {
    return NextResponse.json(
      { error: "Semester setting not found." },
      { status: 400 }
    );
  }
  const currentSemester = semesterSetting.value as Semester;

  const instructor = await prisma.instructor.findUnique({
    where: {
      id: numericId,
    },
  });

  if (!instructor) {
    return NextResponse.json(
      { error: "Instructor not found." },
      { status: 404 }
    );
  }

  const instructorSchedule = await prisma.scheduledInstructor.findMany({
    where: {
      instructorId: numericId,
      scheduledSubject: {
        subject: {
          semester: currentSemester,
        },
      },
    },
    select: {
      scheduledSubject: {
        include: {
          room: true,
          section: true,
          subject: true,
        },
      },
    },
  });

  if (!instructorSchedule) {
    return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
  }

  const sorted = instructorSchedule.sort((a, b) => {
    const dayDiff =
      DAYS_ORDER.indexOf(a.scheduledSubject.day) -
      DAYS_ORDER.indexOf(b.scheduledSubject.day);
    if (dayDiff !== 0) return dayDiff;
    return (
      toMinutes(a.scheduledSubject.startTime) -
      toMinutes(b.scheduledSubject.startTime)
    );
  });

  const schedule = sorted.map((s) => s.scheduledSubject);

  return NextResponse.json(schedule);
});
