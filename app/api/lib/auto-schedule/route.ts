import { createApiHandler } from "@/lib/api/api-handler";
import { validateRequestBody } from "@/lib/api/api-validator";
import { autoScheduleSubjects } from "@/lib/auto-schedule";
import { prisma } from "@/lib/prisma";
import {
  calculateRemainingUnits,
  diffMinutes,
  findSlot,
  toMinutes,
} from "@/lib/schedule-utils";
import { capitalizeEachWord } from "@/lib/utils";
import { Day, ScheduledSubject } from "@prisma/client";
import { NextResponse } from "next/server";

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const requiredFields = [{ key: "sectionId", type: "number" }];

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

  if (isNaN(sectionId)) {
    return NextResponse.json({ error: "Invalid section ID." }, { status: 400 });
  }

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { course: true },
  });

  if (!section) {
    return NextResponse.json({ error: `Section not found.` }, { status: 404 });
  }

  const courseSubjects = await prisma.courseSubject.findMany({
    where: { courseId: section.courseId, year: section.year },
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

  const subjects = courseSubjects.map((cs) => {
    const subject = cs.subject;

    const scheduledMinutes = subject.scheduledSubject.reduce(
      (sum, sched) => sum + diffMinutes(sched.startTime, sched.endTime),
      0
    );

    const requiredMinutes = subject.units * 60;

    return {
      ...subject,
      scheduledMinutes,
      requiredMinutes,
    };
  });

  const existingSchedules = await prisma.scheduledSubject.findMany();

  const rooms = await prisma.room.findMany();

  const result = autoScheduleSubjects(
    subjects,
    existingSchedules,
    rooms,
    sectionId,
    {
      stepMinutes: 30,
      attemptsPerSession: 500,
    }
  );

  return NextResponse.json(result);
});
