type Schedule = {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
};

const DAY_START = "7:30";
const DAY_END = "19:30";

// Convert time "HH:mm" to minutes
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Convert minutes to "HH:mm"
function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

// Finds available slot | 1 unit == 1 hr
function findAvailableSchedule(
  units: number,
  scheduled: Schedule[]
): Schedule | boolean {
  const unitMinutes = units * 60;

  // Sort scheduled by start time
  const sorted = [...scheduled].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
  );

  // Add boundaries (start and end of the day)
  const allSlots = [
    { startTime: DAY_START, endTime: DAY_START },
    ...sorted,
    { startTime: DAY_END, endTime: DAY_END },
  ];

  // Check gaps between schedules
  for (let i = 0; i < allSlots.length - 1; i++) {
    const currentEnd = toMinutes(allSlots[i].endTime);
    const nextStart = toMinutes(allSlots[i + 1].startTime);

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

// Example use
// const scheduled = [
//   { startTime: "7:30", endTime: "9:00" },
//   { startTime: "9:30", endTime: "11:00" },
//   { startTime: "11:00", endTime: "13:00" },
//   { startTime: "15:00", endTime: "19:30" },
// ];

// console.log(findAvailableSchedule(3, scheduled));
// Example output: { startTime: '13:00', endTime: '16:00' }
