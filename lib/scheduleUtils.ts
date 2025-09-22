import { Day } from "@prisma/client";

type Schedule = {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  day: string; // "Monday", etc...
};

type Slot = Omit<Schedule, "day">;

const AVAILABLE_DAYS = Object.values(Day);

const DAY_START = "7:30";
const DAY_END = "19:30";

// Convert time "HH:mm" to minutes
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toHours(mins: number): number {
  return mins / 60;
}

// Convert minutes to "HH:mm"
export function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function diffMinutes(start: string, end: string) {
  return toMinutes(end) - toMinutes(start);
}

export function normalizeTime(value?: string) {
  if (!value) return "";
  const [h, m] = value.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

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

// example usage
// Find a 2-unit class (2 hours) with 15 min spacing
// console.log(findAvailableSchedule(2, scheduled, 0));

export function findSlot(
  units: number,
  scheduled: Slot[]
  // spacingMinutes: number = 0
): Slot | boolean {
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
