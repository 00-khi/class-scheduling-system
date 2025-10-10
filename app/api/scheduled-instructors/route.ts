import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { hasInstructorScheduleConflict, toMinutes } from "@/lib/schedule-utils";
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

  const scheduledInstructors = await prisma.scheduledInstructor.findMany({
    where: {
      scheduledSubject: { subject: { semester: currentSemester } },
    },
    include: {
      instructor: true,
      scheduledSubject: {
        include: { subject: true, section: true, room: true },
      },
    },
  });

  const sorted = scheduledInstructors.sort((a, b) => {
    const dayDiff =
      DAYS_ORDER.indexOf(a.scheduledSubject.day) -
      DAYS_ORDER.indexOf(b.scheduledSubject.day);
    if (dayDiff !== 0) return dayDiff;
    return (
      toMinutes(a.scheduledSubject.startTime) -
      toMinutes(b.scheduledSubject.startTime)
    );
  });

  return NextResponse.json(sorted);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const requiredFields = [
    { key: "instructorId", type: "number" },
    { key: "scheduledSubjectId", type: "number" },
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

  const instructorId = Number(rawData.instructorId);
  const scheduledSubjectId = Number(rawData.scheduledSubjectId);

  const instructor = await prisma.instructor.findUnique({
    where: {
      id: instructorId,
    },
  });

  const scheduledSubject = await prisma.scheduledSubject.findUnique({
    where: {
      id: scheduledSubjectId,
      scheduledInstructor: null,
    },
  });

  if (!instructor) {
    return NextResponse.json(
      {
        error: "Instructor not found.",
      },
      { status: 400 }
    );
  }

  if (!scheduledSubject) {
    return NextResponse.json(
      {
        error: "Scheduled Subject not found or might be already assigned.",
      },
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

  const exisitingInstructorSchedules =
    await prisma.scheduledInstructor.findMany({
      where: {
        instructorId,
        scheduledSubject: {
          subject: {
            semester: currentSemester,
          },
        },
      },
      select: {
        scheduledSubject: true,
      },
    });

  if (
    hasInstructorScheduleConflict(
      scheduledSubject,
      exisitingInstructorSchedules
    )
  ) {
    return NextResponse.json(
      {
        error: `Conflict detected.`,
      },
      { status: 400 }
    );
  }

  const newInstructorSchedule = await prisma.scheduledInstructor.create({
    data: {
      instructorId,
      scheduledSubjectId,
    },
  });

  return NextResponse.json(newInstructorSchedule);
});
