import { Day, ScheduledInstructor, ScheduledSubject } from "@prisma/client";

type Subject = {
  id: number;
  units: number;
  requiredMinutes: number;
  scheduledMinutes: number;
  scheduledSubject: { startTime: string; endTime: string; day: string }[];
};

type ScheduleWithRelations = {
  roomId: number;
  sectionId: number;
  subjectId: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  day: string;
};

type FindSlotSchedule = {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
};

// "7:30" to "19:30", walang bawas walang dagdag. only allow times in 15-minute steps (00, 15, 30, 45) between 07:30 and 19:30
const VALID_TIME_REGEX =
  /^(?:0?7:30|0?[8-9]:(00|15|30|45)|1[0-8]:(00|15|30|45)|19:(00|15|30))$/;

// days from Day enum in prisma
export const AVAILABLE_DAYS = Object.values(Day);

// day start and day end
export const DAY_START = "7:30";
export const DAY_END = "19:30";

// convert time "HH:mm" to minutes
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// convert minutes to hour
export function toHours(mins: number): number {
  return mins / 60;
}

// convert minutes to "HH:mm" format
export function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

// duration
export function diffMinutes(start: string, end: string) {
  return toMinutes(end) - toMinutes(start);
}

// example: "7:30" converts to "07:30"
export function normalizeTime(value?: string) {
  if (!value) return "";
  const [h, m] = value.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

// example: "19:30" converts to "7:30 PM"
export const formatTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

// validates time, must not earlier than startTime and exceeds endTime
export function isValidTime(str: string): boolean {
  return VALID_TIME_REGEX.test(str);
}

// checks if end is ahead of start
export function isValidRange(start: string, end: string): boolean {
  if (!isValidTime(start) || !isValidTime(end)) return false;
  return toMinutes(end) > toMinutes(start);
}

export function isValidDays(value: string): boolean {
  try {
    const arr = JSON.parse(value as string);
    if (!Array.isArray(arr)) return false;
    return arr.every((d) => Object.values(Day).includes(d));
  } catch {
    return false;
  }
}

// finds slot based on provided schedule array
export function findSlot(
  units: number,
  scheduled: FindSlotSchedule[]
  // spacingMinutes: number = 0
): FindSlotSchedule | boolean {
  const unitMinutes = units * 60;

  // Sort schedules
  const sorted = [...scheduled].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
  );

  // Add day boundaries
  const allSlots = [
    { startTime: DAY_START, endTime: DAY_START },
    ...sorted,
    { startTime: DAY_END, endTime: DAY_END },
  ];

  for (let i = 0; i < allSlots.length - 1; i++) {
    // Current block ends, add spacing
    const currentEnd = toMinutes(allSlots[i].endTime);
    // Next block starts, subtract spacing
    const nextStart = toMinutes(allSlots[i + 1].startTime);

    // Apply spacing only if not at day boundary
    // if (allSlots[i].endTime !== DAY_START) {
    //   currentEnd += spacingMinutes;
    // }
    // if (allSlots[i + 1].startTime !== DAY_END) {
    //   nextStart -= spacingMinutes;
    // }

    const freeTime = nextStart - currentEnd;

    if (freeTime >= unitMinutes) {
      const start = currentEnd;
      const end = start + unitMinutes;
      return {
        startTime: toTime(start),
        endTime: toTime(end),
      };
    }
  }

  return false;
}

// gets the unit and the schedule of the subject then calculate the scheduled time to get the remaining units
export function calculateRemainingUnits(
  subjectUnits: number,
  schedules: { startTime: string; endTime: string }[]
): number {
  // Total scheduled minutes
  const scheduledMinutes = schedules.reduce((sum, sched) => {
    return sum + (toMinutes(sched.endTime) - toMinutes(sched.startTime));
  }, 0);

  const scheduledUnits = scheduledMinutes / 60;
  const remainingUnits = subjectUnits - scheduledUnits;

  return Math.max(remainingUnits, 0); // prevent negative
}

// checks if the provided subject schedule have conflict
export function hasSectionAndRoomConflict(
  toSchedule: ScheduleWithRelations,
  existingSchedule: ScheduleWithRelations[]
): boolean {
  const start = toMinutes(toSchedule.startTime);
  const end = toMinutes(toSchedule.endTime);

  return existingSchedule.some((s) => {
    if (s.day.toLowerCase() !== toSchedule.day.toLowerCase()) return false;

    const sStart = toMinutes(s.startTime);
    const sEnd = toMinutes(s.endTime);

    // Check overlap
    const overlap = start < sEnd && end > sStart;

    // Conflict if same section OR same room
    return (
      overlap &&
      (s.sectionId === toSchedule.sectionId || s.roomId === toSchedule.roomId)
    );
  });
}

// checks if the provided instructor schedule have conflict
export function hasInstructorScheduleConflict(
  toSchedule: ScheduledSubject,
  existingSchedules: {
    scheduledSubject: ScheduledSubject;
  }[]
): boolean {
  return existingSchedules.some(({ scheduledSubject }) => {
    // Check same day
    if (scheduledSubject.day !== toSchedule.day) return false;

    // Convert times to minutes
    const [startH1, startM1] = scheduledSubject.startTime
      .split(":")
      .map(Number);
    const [endH1, endM1] = scheduledSubject.endTime.split(":").map(Number);
    const [startH2, startM2] = toSchedule.startTime.split(":").map(Number);
    const [endH2, endM2] = toSchedule.endTime.split(":").map(Number);

    const start1 = startH1 * 60 + startM1;
    const end1 = endH1 * 60 + endM1;
    const start2 = startH2 * 60 + startM2;
    const end2 = endH2 * 60 + endM2;

    // Conflict if times overlap
    return start1 < end2 && start2 < end1;
  });
}

// ---------------- AUTO SCHEDULE

// gets 1 randomly in an array
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// generates time slots starting 7:30 to 19:30, in 30 minutes step
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  let mins = 7 * 60 + 30; // 07:30 in minutes
  const end = 19 * 60 + 30;
  while (mins <= end) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${h}:${m.toString().padStart(2, "0")}`);
    mins += 30; // step of 30 mins
  }
  return slots;
}

// auto schedule function na puro error
export function autoSchedule(
  subjects: Subject[],
  existing: ScheduleWithRelations[],
  sectionId: number,
  roomId: number
): ScheduleWithRelations[] {
  const results: ScheduleWithRelations[] = [];
  const slots = generateTimeSlots();

  for (const subj of subjects) {
    const remaining = subj.requiredMinutes - subj.scheduledMinutes;
    if (remaining <= 0) continue;

    let minutesLeft = remaining;

    while (minutesLeft > 0) {
      const duration = Math.min(60, minutesLeft); // schedule in 1hr blocks
      const day = randomChoice(Object.values(Day));
      const start = randomChoice(slots);
      const endMinutes = toMinutes(start) + duration;
      const end = toTime(endMinutes);

      const candidate: ScheduleWithRelations = {
        startTime: start,
        endTime: end,
        day,
        sectionId,
        roomId,
        subjectId: subj.id,
      };

      if (!hasSectionAndRoomConflict(candidate, [...existing, ...results])) {
        results.push(candidate);
        minutesLeft -= duration;
      }
    }
  }

  return results;
}
