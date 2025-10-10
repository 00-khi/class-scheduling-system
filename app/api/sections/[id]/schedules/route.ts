import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityHandlers } from "@/lib/api/entity-handler";
import { prisma } from "@/lib/prisma";
import { diffMinutes, toMinutes } from "@/lib/schedule-utils";
import { Day, ScheduledSubject } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const DAYS_ORDER = Object.values(Day);

  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid section ID." }, { status: 400 });
  }

  // get the section to read its semester
  const section = await prisma.section.findUnique({
    where: { id: numericId },
    select: { semester: true },
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const scheduledSubject = await prisma.scheduledSubject.findMany({
    where: {
      sectionId: numericId,
      subject: { semester: section.semester }, // filter by semester
    },
    include: {
      room: true,
      subject: true,
      scheduledInstructor: {
        select: {
          instructor: true,
        },
      },
    },
  });

  if (!scheduledSubject) {
    return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
  }

  // V1
  // const sorted = scheduledSubject.sort((a, b) => {
  //   const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
  //   if (dayDiff !== 0) return dayDiff;

  //   return toMinutes(a.startTime) - toMinutes(b.startTime);
  // });

  // V2, uncomment v1 and remove v2 if mag error
  // Group by subjectId to calculate scheduledMinutes per subject
  const grouped = scheduledSubject.reduce<Record<number, number>>(
    (acc, sched) => {
      acc[sched.subjectId] =
        (acc[sched.subjectId] || 0) +
        diffMinutes(sched.startTime, sched.endTime);
      return acc;
    },
    {}
  );

  const enriched = scheduledSubject.map((sched) => {
    const requiredMinutes = sched.subject.units * 60;
    const scheduledMinutes = grouped[sched.subjectId] || 0;

    return {
      ...sched,
      scheduledMinutes,
      requiredMinutes,
    };
  });

  const sorted = enriched.sort((a, b) => {
    const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  return NextResponse.json(sorted);
});
