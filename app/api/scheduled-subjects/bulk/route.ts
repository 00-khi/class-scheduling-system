import { createApiHandler } from "@/lib/api/api-handler";
import { NextResponse } from "next/server";
import { Day, ScheduledSubject, Semester } from "@prisma/client";
import {
  calculateRemainingUnits,
  diffMinutes,
  hasSectionAndRoomConflict,
  isValidRange,
  isValidTime,
  toHours,
  toMinutes,
} from "@/lib/schedule-utils";
import { capitalizeEachWord } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const requiredFields = [{ key: "schedules", type: "array" }];

  for (const { key, type } of requiredFields) {
    const value = rawData[key];

    // Basic presence check
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

    // Array element validation
    if (key === "schedules") {
      if (!Array.isArray(value) || value.length === 0) {
        return NextResponse.json(
          { error: "Schedules must be a non-empty array" },
          { status: 400 }
        );
      }

      const requiredScheduleKeys = {
        startTime: "string",
        endTime: "string",
        day: "string",
        subjectId: "number",
        sectionId: "number",
        roomId: "number",
      };

      const validDays = Object.values(Day);

      for (let i = 0; i < value.length; i++) {
        const schedule = value[i];

        if (typeof schedule !== "object" || Array.isArray(schedule)) {
          return NextResponse.json(
            { error: `Schedule at index ${i} must be an object` },
            { status: 400 }
          );
        }

        for (const [field, expectedType] of Object.entries(
          requiredScheduleKeys
        )) {
          const fieldValue = schedule[field];

          if (
            fieldValue === undefined ||
            fieldValue === null ||
            fieldValue === ""
          ) {
            return NextResponse.json(
              { error: `Missing field '${field}' in schedule at index ${i}` },
              { status: 400 }
            );
          }

          const actualFieldType = typeof fieldValue;
          if (actualFieldType !== expectedType) {
            return NextResponse.json(
              {
                error: `Invalid type for '${field}' in schedule at index ${i}. Expected ${expectedType}, got ${actualFieldType}.`,
              },
              { status: 400 }
            );
          }
        }

        // Extra validation for IDs
        if (isNaN(schedule.sectionId)) {
          return NextResponse.json(
            { error: `Invalid section ID in schedule at index ${i}.` },
            { status: 400 }
          );
        }

        if (isNaN(schedule.subjectId)) {
          return NextResponse.json(
            { error: `Invalid subject ID in schedule at index ${i}.` },
            { status: 400 }
          );
        }

        if (isNaN(schedule.roomId)) {
          return NextResponse.json(
            { error: `Invalid room ID in schedule at index ${i}.` },
            { status: 400 }
          );
        }

        // Validate day
        if (!validDays.includes(capitalizeEachWord(schedule.day) as Day)) {
          return NextResponse.json(
            {
              error: `Invalid day in schedule at index ${i}. Must be one of: ${validDays.join(
                ", "
              )}`,
            },
            { status: 400 }
          );
        }

        // Validate time format
        if (
          !isValidTime(schedule.startTime) ||
          !isValidTime(schedule.endTime)
        ) {
          return NextResponse.json(
            {
              error: `Invalid time format in schedule at index ${i}.`,
            },
            { status: 400 }
          );
        }

        // Validate time range
        if (!isValidRange(schedule.startTime, schedule.endTime)) {
          return NextResponse.json(
            {
              error: `Invalid time range in schedule at index ${i}.`,
            },
            { status: 400 }
          );
        }
      }
    }
  }

  const schedules = rawData.schedules;

  // Detect internal conflicts within the submitted schedules
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];

      const sameDay = capitalizeEachWord(a.day) === capitalizeEachWord(b.day);
      const sameRoom = a.roomId === b.roomId;
      const sameSection = a.sectionId === b.sectionId;

      if (sameDay && (sameRoom || sameSection)) {
        // Check time overlap
        if (hasSectionAndRoomConflict(a, [b])) {
          return NextResponse.json(
            {
              error: `Conflict detected between schedules at index ${i} and ${j} on ${a.day}.`,
            },
            { status: 400 }
          );
        }
      }
    }
  }

  // Get current semester
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

  // Check all schedules before creating any
  for (const sched of schedules) {
    const { roomId, sectionId, subjectId, startTime, endTime, day } = sched;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
    });

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found." }, { status: 400 });
    }

    if (!section) {
      return NextResponse.json(
        { error: "Section not found." },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: `Subject not found.` },
        { status: 400 }
      );
    }

    // Fetch existing schedules for the same semester
    const [
      existingRoomSchedules,
      existingSectionSchedules,
      existingRoomSectionSchedules,
    ] = await Promise.all([
      prisma.scheduledSubject.findMany({
        where: {
          roomId,
          day: capitalizeEachWord(day) as Day,
          subject: { semester: currentSemester },
        },
      }),
      prisma.scheduledSubject.findMany({
        where: {
          sectionId,
          day: capitalizeEachWord(day) as Day,
          subject: { semester: currentSemester },
        },
      }),
      prisma.scheduledSubject.findMany({
        where: {
          subjectId,
          sectionId,
          subject: { semester: currentSemester },
        },
        include: { subject: true },
      }),
    ]);

    const remainingUnits = calculateRemainingUnits(
      subject.units,
      existingRoomSectionSchedules
    );

    const duration = toHours(diffMinutes(startTime, endTime));
    if (duration > remainingUnits) {
      return NextResponse.json(
        {
          error: `Duration must not exceed remaining units for subjectId ${subjectId}. Remaining: ${remainingUnits}`,
        },
        { status: 400 }
      );
    }

    const mergedExistingSchedules = [
      ...existingRoomSchedules,
      ...existingSectionSchedules,
    ].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    if (hasSectionAndRoomConflict(sched, mergedExistingSchedules)) {
      return NextResponse.json(
        {
          error: `Conflict detected for subjectId ${subjectId} on ${day}.`,
        },
        { status: 400 }
      );
    }
  }

  // If all checks pass, create all schedules at once
  // const created = await prisma.scheduledSubject.createMany({
  //   data: schedules.map((sched: ScheduledSubject) => ({
  //     roomId: sched.roomId,
  //     sectionId: sched.sectionId,
  //     subjectId: sched.subjectId,
  //     startTime: sched.startTime,
  //     endTime: sched.endTime,
  //     day: capitalizeEachWord(sched.day) as Day,
  //   })),
  // });

  return NextResponse.json(schedules);
});
