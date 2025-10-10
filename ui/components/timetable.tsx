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

type Schedule = {
  id: number;
  startTime: string;
  endTime: string;
  day: string;
  room?: {
    name: string;
    type: string;
  };
  subject?: {
    code?: string;
    name?: string;
    type?: string;
  };
  scheduledInstructor?: {
    instructor?: {
      name?: string;
    };
  };
  section?: {
    name?: string;
  };
};

type Props = {
  schedule: Schedule[];
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export default function Timetable({ schedule }: Props) {
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
    const map = new Map<string, Schedule[]>();
    for (const d of AVAILABLE_DAYS) map.set(d, []);
    for (const s of schedule) {
      if (!map.has(s.day)) map.set(s.day, []);
      map.get(s.day)!.push(s);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    }
    return map;
  }, [schedule, AVAILABLE_DAYS]);

  function blockStyle(startTime: string, endTime: string) {
    const s = clamp(toMinutes(startTime), startMinutes, endMinutes);
    const e = clamp(toMinutes(endTime), startMinutes, endMinutes);

    const topRem = ((s - startMinutes) / 15) * 2;
    const heightRem = Math.max(((e - s) / 15) * 2);

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
                    {/* <div className="text-xs opacity-70">
                      {formatTime(s.startTime)} -
                    </div>
                    <div className="text-xs opacity-70">
                      {formatTime(s.endTime)}
                    </div> */}

                    {s.section?.name && (
                      <div className="font-medium truncate">
                        {s.section.name}
                      </div>
                    )}

                    {s.subject?.code && (
                      <div className="text-xs opacity-80 truncate">
                        {s.subject.code}
                      </div>
                    )}

                    {s.subject?.name && (
                      <div className="font-medium truncate">
                        {s.subject.name}
                      </div>
                    )}

                    {s.room?.name && (
                      <div className="text-xs opacity-80 truncate">
                        {s.room.name}
                      </div>
                    )}

                    {!(s.room?.name && s.section?.name && s.subject?.name) && (
                      <div className="font-medium truncate">
                        {s.scheduledInstructor?.instructor?.name || "TBA"}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <span className="font-medium">Time: </span>
                    <span className="opacity-80">
                      {formatTime(s.startTime)} - {formatTime(s.endTime)}
                    </span>
                  </div>

                  {s.subject?.name && (
                    <div>
                      <span className="font-medium">Subject: </span>
                      <span className="opacity-80">
                        {s.subject.code ? `${s.subject.code} - ` : ""}
                        {s.subject.name}
                      </span>
                    </div>
                  )}

                  {s.section?.name && (
                    <div>
                      <span className="font-medium">Section: </span>
                      <span className="opacity-80">{s.section.name}</span>
                    </div>
                  )}

                  {s.room?.name && (
                    <div>
                      <span className="font-medium">Room: </span>
                      <span className="opacity-80">{s.room.name}</span>
                    </div>
                  )}

                  {!(s.room?.name && s.section?.name && s.subject?.name) && (
                    <div>
                      <span className="font-medium">Instructor: </span>
                      <span className="opacity-80">
                        {s.scheduledInstructor?.instructor?.name || "TBA"}
                      </span>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
