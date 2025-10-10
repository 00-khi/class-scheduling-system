"use client";

import {
  AVAILABLE_DAYS,
  DAY_START,
  DAY_END,
  toMinutes,
} from "@/lib/schedule-utils";
import { Skeleton } from "@/ui/shadcn/skeleton";
import { useMemo } from "react";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function generateRandomSchedule() {
  const formatTime = (mins: number) => {
    const hh = Math.floor(mins / 60)
      .toString()
      .padStart(1, "0");
    const mm = (mins % 60).toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const start = toMinutes(DAY_START);
  const end = toMinutes(DAY_END);
  const schedule: { day: string; startTime: string; endTime: string }[] = [];

  for (const day of AVAILABLE_DAYS) {
    const blocks: { start: number; end: number }[] = [];
    const numBlocks = Math.floor(Math.random() * 10) + 1; // 1–4 per day

    for (let i = 0; i < numBlocks; i++) {
      const duration = (Math.floor(Math.random() * 6) + 2) * 15; // 30–120 min
      let slotFound = false;

      for (let tries = 0; tries < 50 && !slotFound; tries++) {
        const startTime =
          Math.floor(Math.random() * ((end - start - duration) / 15)) * 15 +
          start;

        const newBlock = { start: startTime, end: startTime + duration };
        const overlap = blocks.some(
          (b) => b.start < newBlock.end && newBlock.start < b.end
        );
        if (!overlap) {
          blocks.push(newBlock);
          slotFound = true;
        }
      }
    }

    blocks.sort((a, b) => a.start - b.start);
    for (const b of blocks) {
      schedule.push({
        day,
        startTime: formatTime(b.start),
        endTime: formatTime(b.end),
      });
    }
  }

  return schedule;
}

export default function TimetableSkeleton() {
  const dummyScheduleData = generateRandomSchedule();

  const startMinutes = toMinutes(DAY_START);
  const endMinutes = toMinutes(DAY_END);

  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    for (let m = startMinutes; m <= endMinutes; m += 15) {
      const hh = Math.floor(m / 60)
        .toString()
        .padStart(2, "0");
      const mm = (m % 60).toString().padStart(2, "0");
      labels.push(`${hh}:${mm}`);
    }
    return labels;
  }, [startMinutes, endMinutes]);

  const schedulesByDay = useMemo(() => {
    const map = new Map<string, typeof dummyScheduleData>();
    for (const d of AVAILABLE_DAYS) map.set(d, []);
    for (const s of dummyScheduleData) {
      if (!map.has(s.day)) map.set(s.day, []);
      map.get(s.day)!.push(s);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    }
    return map;
  }, [dummyScheduleData, AVAILABLE_DAYS]);

  function blockStyle(startTime: string, endTime: string) {
    const s = clamp(toMinutes(startTime), startMinutes, endMinutes);
    const e = clamp(toMinutes(endTime), startMinutes, endMinutes);

    const topRem = ((s - startMinutes) / 15) * 2;
    const heightRem = Math.max(((e - s) / 15) * 2);

    console.log(startMinutes, "START MINUTES");

    return {
      top: `${topRem}rem`,
      height: `${heightRem}rem`,
      left: "0.5rem",
      right: "0.5rem",
    } as React.CSSProperties;
  }

  return (
    <div className="">
      {/* Header */}
      <div className="grid grid-cols-7 border-b">
        <div className="border-r bg-muted/50 p-4">
          <Skeleton className="h-6 w-full bg-muted" />
        </div>
        {AVAILABLE_DAYS.map((day) => (
          <div
            key={day}
            className="border-r last:border-r-0 bg-muted/50 p-4 text-center"
          >
            <Skeleton className="h-6 w-full bg-muted" />
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="grid grid-cols-7 relative">
        {/* Time column */}
        <div className="border-r">
          {timeLabels.map((time) => (
            <div
              key={time}
              className="h-8 border-b border-dashed flex items-center px-2 text-sm text-muted-foreground"
            >
              <Skeleton className="h-4 w-[60%] bg-muted" />
            </div>
          ))}
        </div>

        {/* Day columns */}
        {AVAILABLE_DAYS.map((day) => (
          <div key={day} className="border-r last:border-r-0 relative">
            {timeLabels.map((time) => (
              <div
                key={`${day}-${time}`}
                className="h-8 border-b border-dashed"
              />
            ))}

            {/* SCHEDULE BLOCKS */}
            {schedulesByDay.get(day)?.map((s, idx) => (
              <div
                key={idx}
                className="absolute bg-background text-primary-foreground p-2 rounded text-xs overflow-hidden hover:opacity-90 transition-opacity border"
                style={blockStyle(s.startTime, s.endTime)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
