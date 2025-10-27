import { createApiHandler } from "@/lib/api/api-handler";
import { autoScheduleSubjects } from "@/lib/auto-schedule";
import { prisma } from "@/lib/prisma";
import { AVAILABLE_DAYS, diffMinutes, toMinutes } from "@/lib/schedule-utils";
import { Day } from "@prisma/client";
import { NextResponse } from "next/server";

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const requiredFields = [
    { key: "sectionId", type: "number" },
    { key: "days", type: "array" },
    { key: "roomIds", type: "array" },
  ];

  for (const { key, type } of requiredFields) {
    const value = rawData[key];

    if (value === undefined || value === null || value === "") {
      return NextResponse.json(
        { error: `Missing required field: ${key}` },
        { status: 400 }
      );
    }

    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== type) {
      return NextResponse.json(
        {
          error: `Invalid type for field ${key}. Expected ${type}, got ${actualType}.`,
        },
        { status: 400 }
      );
    }
  }

  const VALID_DAYS = Object.values(Day);

  const sectionId = Number(rawData.sectionId);
  const days = [...new Set(rawData.days)].filter((d): d is Day =>
    VALID_DAYS.includes(d as Day)
  );

  const rooms = await prisma.room.findMany();

  const roomIds = [...new Set(rawData.roomIds)].filter(
    (id): id is number =>
      typeof id === "number" && rooms.some((r) => r.id === id)
  );

  if (isNaN(sectionId)) {
    return NextResponse.json({ error: "Invalid section ID." }, { status: 400 });
  }

  if (days.length === 0) {
    return NextResponse.json(
      { error: "No valid days provided." },
      { status: 400 }
    );
  }

  if (roomIds.length === 0) {
    return NextResponse.json(
      { error: "No valid room IDs provided." },
      { status: 400 }
    );
  }

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { course: true },
  });

  if (!section) {
    return NextResponse.json({ error: `Section not found.` }, { status: 404 });
  }

  const courseSubjects = await prisma.courseSubject.findMany({
    where: {
      courseId: section.courseId,
      year: section.year,
      subject: { semester: section.semester }, // filter by semester
    },
    include: {
      subject: {
        include: {
          scheduledSubject: {
            where: { sectionId: section.id },
          },
        },
      },
    },
  });

  const subjects = courseSubjects
    .map((cs) => {
      const subject = cs.subject;

      const scheduledMinutes = subject.scheduledSubject.reduce(
        (sum, sched) => sum + diffMinutes(sched.startTime, sched.endTime),
        0
      );

      const requiredMinutes = subject.hours * 60;

      return {
        ...subject,
        scheduledMinutes,
        requiredMinutes,
      };
    })
    .filter((s) => s.scheduledMinutes < s.requiredMinutes);

  const existingSchedules = await prisma.scheduledSubject.findMany();

  const selectedRooms = await prisma.room.findMany({
    where: {
      id: {
        in: roomIds,
      },
    },
  });

  const result = autoScheduleSubjects(
    subjects,
    existingSchedules,
    selectedRooms,
    sectionId,
    {
      stepMinutes: 30,
      attemptsPerSession: 500,
      days,
    }
  );

  // sort the generated draft schedules
  result.newSchedules.sort((a, b) => {
    const dayDiff =
      AVAILABLE_DAYS.indexOf(a.day) - AVAILABLE_DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  return NextResponse.json(result);
});
