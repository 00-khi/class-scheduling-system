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
    return NextResponse.json({ error: "Invalid room ID." }, { status: 400 });
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

  const room = await prisma.room.findUnique({
    where: {
      id: numericId,
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const roomSchedule = await prisma.scheduledSubject.findMany({
    where: {
      roomId: numericId,
      subject: {
        semester: currentSemester,
      },
    },
    include: {
      section: true,
      subject: true,
    },
  });

  if (!roomSchedule) {
    return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
  }

  const sorted = roomSchedule.sort((a, b) => {
    const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  return NextResponse.json(sorted);
});
