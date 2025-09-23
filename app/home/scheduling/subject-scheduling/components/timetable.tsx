"use client";

import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";
import {
  AVAILABLE_DAYS,
  DAY_START,
  DAY_END,
  formatTime,
  toMinutes,
} from "@/lib/schedule-utils";
import { Badge } from "@/ui/shadcn/badge";

type ScheduledItem = {
  id: number;
  startTime: string;
  endTime: string;
  day: string;
  sectionId: number;
  roomId: number;
  subjectId: number;
  room?: { id: number; name: string; type: string };
  subject?: { id: number; code?: string; name?: string; type?: string };
};

type Props = {
  scheduled: ScheduledItem[];
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export default function Timetable({ scheduled }: Props) {
  const startMinutes = toMinutes(DAY_START);
  const endMinutes = toMinutes(DAY_END);

  // Labels shown in the left column
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

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>();
    for (const d of AVAILABLE_DAYS) map.set(d, []);
    for (const s of scheduled) {
      if (!map.has(s.day)) map.set(s.day, []);
      map.get(s.day)!.push(s);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    }
    return map;
  }, [scheduled, AVAILABLE_DAYS]);

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
    <>
      {/* Header row */}
      <div className="grid grid-cols-7 border-b">
        <div className="border-r bg-muted/50 p-4">Time</div>
        {AVAILABLE_DAYS.map((day) => (
          <div
            key={day}
            className="border-r last:border-r-0 bg-muted/50 p-4 text-center"
          >
            <div>{day}</div>
          </div>
        ))}
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-7 relative">
        {/* Time labels column */}
        <div className="border-r">
          {timeLabels.map((time) => (
            <div
              key={time}
              className="h-8 border-b border-dashed flex items-center px-2 text-sm text-muted-foreground"
            >
              {formatTime(time)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {AVAILABLE_DAYS.map((day) => (
          <div key={day} className="border-r last:border-r-0 relative">
            {/* Empty grid slots for hover background */}
            {timeLabels.map((time) => (
              <div
                key={`${day}-${time}`}
                className="h-8 border-b border-dashed hover:bg-muted/30"
              />
            ))}

            {/* Schedule blocks */}
            {schedulesByDay.get(day)?.map((s) => (
              <Tooltip key={s.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute bg-primary text-primary-foreground p-2 rounded text-xs overflow-hidden hover:opacity-90 transition-opacity border"
                    style={blockStyle(s.startTime, s.endTime)}
                  >
                    <div className="text-xs opacity-70">
                      {formatTime(s.startTime)} -
                    </div>
                    <div className="text-xs opacity-70">
                      {formatTime(s.endTime)}
                    </div>
                    <div className="text-xs opacity-80 truncate">
                      {s.subject?.code ?? ""}
                    </div>
                    <div className="font-medium truncate">
                      {s.subject?.name ?? "Subject"}
                    </div>
                    <div className="text-xs opacity-80 truncate">
                      {s.room?.name ?? s.roomId}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {`${formatTime(s.startTime)} - ${formatTime(s.endTime)} | ${
                    s.subject?.name ?? "Subject"
                  } | ${s.room?.name ?? s.roomId}`}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
