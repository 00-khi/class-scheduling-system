import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import {
  calculateRemainingUnits,
  diffMinutes,
  isConflict,
  isValidRange,
  isValidTime,
  toHours,
  toMinutes,
} from "@/lib/schedule-utils";
import { capitalizeEachWord } from "@/lib/utils";
import { Day, Semester } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const semester = searchParams.get("semester") as Semester;
  const validSemesters = Object.values(Semester);

  if (!semester) {
    return NextResponse.json(
      {
        error: `Please enter a semester`,
      },
      { status: 400 }
    );
  }

  if (!validSemesters.includes(semester)) {
    return NextResponse.json(
      {
        error: `Invalid semester. Must be one of: ${validSemesters.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const scheduledSubjects = await prisma.scheduledSubject.findMany({
    include: {
      room: true,
      subject: true,
    },
    where: { subject: { semester } },
  });
  return NextResponse.json(scheduledSubjects);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const requiredFields = [
    { key: "sectionId", type: "number" },
    { key: "subjectId", type: "number" },
    { key: "roomId", type: "number" },
    { key: "day", type: "string" },
    { key: "startTime", type: "string" },
    { key: "endTime", type: "string" },
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

  const sectionId = Number(rawData.sectionId);
  const subjectId = Number(rawData.subjectId);
  const roomId = Number(rawData.roomId);
  const day = rawData.day;
  const startTime = rawData.startTime;
  const endTime = rawData.endTime;

  const validDays = Object.values(Day);

  if (isNaN(sectionId)) {
    return NextResponse.json({ error: "Invalid section ID." }, { status: 400 });
  }

  if (isNaN(subjectId)) {
    return NextResponse.json({ error: "Invalid subject ID." }, { status: 400 });
  }

  if (isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid room ID." }, { status: 400 });
  }

  if (!validDays.includes(capitalizeEachWord(day) as Day)) {
    return NextResponse.json(
      {
        error: `Invalid day. Must be: ${validDays.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return NextResponse.json(
      {
        error: `Invalid time format.`,
      },
      { status: 400 }
    );
  }

  if (!isValidRange(startTime, endTime)) {
    return NextResponse.json(
      {
        error: `Invalid time range.`,
      },
      { status: 400 }
    );
  }

  const toSchedule = {
    roomId,
    sectionId,
    subjectId,
    startTime,
    endTime,
    day,
  };

  const existingRoomSchedules = await prisma.scheduledSubject.findMany({
    where: { roomId, day: capitalizeEachWord(day) as Day },
  });

  const existingSectionSchedules = await prisma.scheduledSubject.findMany({
    where: { sectionId, day: capitalizeEachWord(day) as Day },
  });

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  const existingRoomSectionSchedules = await prisma.scheduledSubject.findMany({
    where: { subjectId, sectionId },
    include: { subject: true },
  });

  if (!subject) {
    return NextResponse.json({ error: "Subject not found." }, { status: 400 });
  }

  const remainingUnits = calculateRemainingUnits(
    subject.units,
    existingRoomSectionSchedules
  );

  const duration = toHours(diffMinutes(startTime, endTime));

  console.log(toHours(diffMinutes(startTime, endTime)), remainingUnits);

  if (duration > remainingUnits) {
    return NextResponse.json(
      {
        error: `Duration must not exceed remaining units: ${remainingUnits}`,
      },
      { status: 400 }
    );
  }

  const mergedExistingSchedules = [
    ...existingRoomSchedules,
    ...existingSectionSchedules,
  ].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  if (isConflict(toSchedule, mergedExistingSchedules)) {
    return NextResponse.json(
      {
        error: `Conflict detected.`,
      },
      { status: 400 }
    );
  }

  const newSchedule = await prisma.scheduledSubject.create({
    data: toSchedule,
  });

  return NextResponse.json(mergedExistingSchedules);
});
