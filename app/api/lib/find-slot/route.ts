import { createApiHandler } from "@/lib/api/api-handler";
import { validateRequestBody } from "@/lib/api/api-validator";
import { prisma } from "@/lib/prisma";
import {
  calculateRemainingUnits,
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

  const requiredFields = [
    { key: "sectionId", type: "number" },
    { key: "subjectId", type: "number" },
    { key: "roomId", type: "number" },
    { key: "day", type: "string" },
    { key: "unitsToSched", type: "number" },
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
  const unitsToSched = Number(rawData.unitsToSched);
  const day = rawData.day;

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

  if (isNaN(unitsToSched)) {
    return NextResponse.json(
      { error: "Invalid units to schedule." },
      { status: 400 }
    );
  }

  if (!validDays.includes(capitalizeEachWord(day) as Day)) {
    return NextResponse.json(
      {
        error: `Invalid day. Must be: ${validDays.join(", ")}`,
      },
      { status: 400 }
    );
  }

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

  if (unitsToSched < 1) {
    return NextResponse.json(
      { error: "Schedule must be at least 1 unit." },
      { status: 400 }
    );
  }

  if (unitsToSched * 2 !== Math.floor(unitsToSched * 2)) {
    return NextResponse.json(
      { error: "Schedule must be in increments of 0.5 unit." },
      { status: 400 }
    );
  }

  if (unitsToSched > remainingUnits) {
    return NextResponse.json(
      {
        error: `Units to schedule must not exceed remaining units: ${remainingUnits}`,
      },
      { status: 400 }
    );
  }

  // merge both existing schedules of room and section
  const mergedExistingSchedules = [
    ...existingRoomSchedules,
    ...existingSectionSchedules,
  ].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const slot = findSlot(unitsToSched, mergedExistingSchedules);

  if (!slot) {
    return NextResponse.json(
      { error: "No slot found. Please select other room" },
      { status: 400 }
    );
  }

  return NextResponse.json(slot);
});
