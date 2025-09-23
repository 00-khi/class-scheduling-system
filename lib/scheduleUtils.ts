import { Day } from "@prisma/client";

type Schedule = {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  day: string; // "Monday", etc...
};

type CheckConflictSchedule = {
  roomId: number;
  sectionId: number;
  subjectId: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  day: string;
};

type FindSlotSchedule = Omit<Schedule, "day">;

// "7:30" to "19:30", walang bawas walang dagdag. only allow times in 15-minute steps (00, 15, 30, 45) between 07:30 and 19:30
const VALID_TIME_REGEX =
  /^(?:0?7:30|0?[8-9]:(00|15|30|45)|1[0-8]:(00|15|30|45)|19:(00|15|30))$/;

// days from Day enum in prisma
const AVAILABLE_DAYS = Object.values(Day);

// day start and day end
const DAY_START = "7:30";
const DAY_END = "19:30";

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

// finds schedule, if no schedule found, checks other day
// NEED PA AYUSIN, IF WALA MAHANAP NA SCHEDULE SA ROOM AND LAHAT NG DAY IS NACHECK
// DAPAT MAG CHECK DIN SYA SA IBANG ROOM
function findAvailableSchedule(
  units: number,
  scheduled: Schedule[]
  // spacingMinutes: number = 0
): Schedule | boolean {
  const unitMinutes = units * 60;

  for (const day of AVAILABLE_DAYS) {
    // Get schedules for this day
    const daySchedules = scheduled
      .filter((s) => s.day === day)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    // Add day boundaries
    const allSlots = [
      { startTime: DAY_START, endTime: DAY_START, day },
      ...daySchedules,
      { startTime: DAY_END, endTime: DAY_END, day },
    ];

    for (let i = 0; i < allSlots.length - 1; i++) {
      // Current block ends
      let currentEnd = toMinutes(allSlots[i].endTime);
      // Next block starts
      let nextStart = toMinutes(allSlots[i + 1].startTime);

      // Apply spacing only if not at day boundary
      // if (allSlots[i].startTime !== DAY_START) {
      //   currentEnd += spacingMinutes;
      // }
      // if (allSlots[i + 1].endTime !== DAY_END) {
      //   nextStart -= spacingMinutes;
      // }

      const freeTime = nextStart - currentEnd;

      if (freeTime >= unitMinutes) {
        const start = currentEnd;
        const end = start + unitMinutes;
        return {
          startTime: toTime(start),
          endTime: toTime(end),
          day,
        };
      }
    }
  }

  return false;
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
    let currentEnd = toMinutes(allSlots[i].endTime);
    // Next block starts, subtract spacing
    let nextStart = toMinutes(allSlots[i + 1].startTime);

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

// checks if the provided schedule have conflict
export function isConflict(
  toSchedule: CheckConflictSchedule,
  existingSchedule: CheckConflictSchedule[]
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
