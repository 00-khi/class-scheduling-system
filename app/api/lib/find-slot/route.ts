import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { DAY_END, DAY_START, toMinutes, toTime } from "@/lib/schedule-utils";
import { capitalizeEachWord } from "@/lib/utils";
import { Day, Semester } from "@prisma/client";
import { NextResponse } from "next/server";

type Slot = { startTime: string; endTime: string; duration: number };

const DAY_START_MINUTES = toMinutes(DAY_START);
const DAY_END_MINUTES = toMinutes(DAY_END);

// allowed durations in hours
const STANDARD_DURATIONS = [1, 1.5, 2, 3, 4, 6];

function mergeSchedules(
  schedules: Array<{ startTime: string; endTime: string }>
) {
  const ranges = schedules
    .map((s) => ({ s: toMinutes(s.startTime), e: toMinutes(s.endTime) }))
    .sort((a, b) => a.s - b.s);

  const merged: Array<{ s: number; e: number }> = [];
  for (const r of ranges) {
    if (!merged.length) {
      merged.push({ ...r });
      continue;
    }
    const last = merged[merged.length - 1];
    if (r.s <= last.e) {
      last.e = Math.max(last.e, r.e);
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

function invertRanges(occupied: Array<{ s: number; e: number }>) {
  const free: Array<{ s: number; e: number }> = [];
  let cursor = DAY_START_MINUTES;

  for (const o of occupied) {
    if (o.e <= DAY_START_MINUTES) continue;
    if (o.s >= DAY_END_MINUTES) break;

    const start = Math.max(cursor, DAY_START_MINUTES);
    const end = Math.min(o.s, DAY_END_MINUTES);

    if (end > start) free.push({ s: start, e: end });

    cursor = Math.max(cursor, Math.min(o.e, DAY_END_MINUTES));
  }

  if (cursor < DAY_END_MINUTES) free.push({ s: cursor, e: DAY_END_MINUTES });

  return free;
}

function generateSlotsFromGap(
  gap: { s: number; e: number },
  durationMins: number
): Slot[] {
  const slots: Slot[] = [];
  // slide by 15 minute steps
  const step = 15;
  for (let start = gap.s; start + durationMins <= gap.e; start += step) {
    const end = start + durationMins;
    slots.push({
      startTime: toTime(start),
      endTime: toTime(end),
      duration: durationMins / 60,
    });
  }
  return slots;
}

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const raw = await request.json();

  const required = [
    { key: "sectionId", type: "number" },
    { key: "subjectId", type: "number" },
    { key: "roomId", type: "number" },
    { key: "day", type: "string" },
    { key: "hoursToSched", type: "number" },
  ];

  for (const r of required) {
    const v = raw[r.key];
    if (v === undefined || v === null || v === "") {
      return NextResponse.json({ error: `Missing ${r.key}` }, { status: 400 });
    }
    const actualType = Array.isArray(v) ? "array" : typeof v;
    if (actualType !== r.type) {
      return NextResponse.json(
        {
          error: `Invalid type ${r.key}. Expected ${r.type}, got ${actualType}`,
        },
        { status: 400 }
      );
    }
  }

  const sectionId = Number(raw.sectionId);
  const subjectId = Number(raw.subjectId);
  const roomId = Number(raw.roomId);
  const hoursToSched = Number(raw.hoursToSched);
  const day = raw.day;

  const validDays = Object.values(Day);
  if (!validDays.includes(capitalizeEachWord(day) as Day)) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

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

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 400 });
  }

  // scheduled entries for room and section for that day and semester
  const roomSchedules = await prisma.scheduledSubject.findMany({
    where: {
      roomId,
      day: capitalizeEachWord(day) as Day,
      subject: { semester: { in: [currentSemester, "Whole_Semester"] } },
    },
    select: { startTime: true, endTime: true },
  });

  const sectionSchedules = await prisma.scheduledSubject.findMany({
    where: {
      sectionId,
      day: capitalizeEachWord(day) as Day,
      subject: { semester: { in: [currentSemester, "Whole_Semester"] } },
    },
    select: { startTime: true, endTime: true },
  });

  const mergedSchedules = mergeSchedules([
    ...roomSchedules,
    ...sectionSchedules,
  ]);
  const freeGaps = invertRanges(mergedSchedules);

  // pick durations to test. only include standard durations <= hoursToSched and <= subject.hours
  const maxHours = Math.min(hoursToSched, subject.hours);
  const durations = STANDARD_DURATIONS.filter((d) => d <= maxHours);

  const resultSlots: Record<number, Slot[]> = {};
  for (const d of durations) {
    const dMins = Math.round(d * 60);
    const slotsForDur: Slot[] = [];
    for (const gap of freeGaps) {
      const generated = generateSlotsFromGap(gap, dMins);
      slotsForDur.push(...generated);
    }
    // sort by start time
    slotsForDur.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    resultSlots[d] = slotsForDur;
  }

  // flatten with duration key present for convenience
  const flatSlots: Array<Slot & { duration: number }> = [];
  for (const d of Object.keys(resultSlots)) {
    const dur = Number(d);
    for (const s of resultSlots[dur]) {
      flatSlots.push({ ...s, duration: dur });
    }
  }

  console.log(mergedSchedules);

  return NextResponse.json({ slots: flatSlots });
});
