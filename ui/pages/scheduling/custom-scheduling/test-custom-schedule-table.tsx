"use client";

import { useEffect, useMemo, useState } from "react";
import { IScheduledSubject } from "@/types";
import { getAssignedSubjectById } from "@/services/assignedSubjectService";
import { getSubjectById } from "@/services/subjectService";
import { getRooms } from "@/services/roomService";
import { exportScheduleDocx } from "@/lib/exportDocx";
import { overlaps } from "@/lib/scheduleUtils";
import { toast } from "sonner";

export function CustomScheduleTable({
  title,
  note,
  onTitleChange,
  onNoteChange,
  items,
  onRemove,
  onReplaceList,
}: {
  title: string;
  note: string;
  onTitleChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  items: IScheduledSubject[];
  onRemove: (id?: string) => void;
  onReplaceList: (list: IScheduledSubject[]) => void;
}) {
  const rooms = useMemo(() => getRooms(), [items.length]);

  useEffect(() => {
    // keep a simple shared store so scheduled table can check conflicts before adding.
    (window as any).__customScheduleList = items;
    return () => {
      (window as any).__customScheduleList = undefined;
    };
  }, [items]);

  const addManualSlot = (s: IScheduledSubject) => {
    // check conflicts quickly
    for (const it of items) {
      if (it.dayOfWeek === s.dayOfWeek) {
        if (overlaps(it.startTime, it.endTime, s.startTime, s.endTime)) {
          toast.error("New slot overlaps existing item");
          return;
        }
      }
    }
    onReplaceList([...items, s]);
  };

  const dayName = (d: string) => {
    const map: Record<string, string> = {
      "0": "Sunday",
      "1": "Monday",
      "2": "Tuesday",
      "3": "Wednesday",
      "4": "Thursday",
      "5": "Friday",
      "6": "Saturday",
    };
    return map[d] || "Unknown";
  };

  const sortedByDay = useMemo(() => {
    return [...items].sort((a, b) => {
      const ad = parseInt(a.dayOfWeek, 10);
      const bd = parseInt(b.dayOfWeek, 10);
      if (ad !== bd) return ad - bd;
      if (a.startTime !== b.startTime)
        return a.startTime < b.startTime ? -1 : 1;
      return 0;
    });
  }, [items]);

  return (
    <div>
      <div className="mb-2">
        <label className="block mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Custom schedule title"
          className="border rounded px-2 py-1 w-full"
        />
      </div>

      <div className="mb-2">
        <label className="block mb-1">Note</label>
        <input
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Note about this schedule"
          className="border rounded px-2 py-1 w-full"
        />
      </div>

      <div className="mb-3">
        <button
          onClick={() => {
            if (!title) {
              toast.error("Set a title before export");
              return;
            }
            exportScheduleDocx(title, note, sortedByDay);
          }}
          className="px-3 py-1 border rounded"
        >
          Export docx
        </button>
        <button
          onClick={() => {
            onReplaceList([]);
            toast.success("Cleared custom schedule");
          }}
          className="ml-2 px-3 py-1 border rounded"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-[56vh] overflow-y-auto">
        {sortedByDay.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No items in custom
          </div>
        ) : (
          sortedByDay.map((s) => {
            const asg = getAssignedSubjectById(s.assignedSubjectId);
            const subj = asg ? getSubjectById(asg.subjectId) : undefined;
            const room = rooms.find((r) => r._id === s.roomId);
            return (
              <div
                key={s._id}
                className="p-2 border rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {subj ? `${subj.code} - ${subj.title}` : "Unknown subject"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dayName(s.dayOfWeek)}, {s.startTime} - {s.endTime},{" "}
                    {room?.name || "Unknown room"}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      onRemove(s._id);
                      const newList = (window as any).__customScheduleList as
                        | any[]
                        | undefined;
                      const updated = newList
                        ? newList.filter((x) => x._id !== s._id)
                        : [];
                      (window as any).__customScheduleList = updated;
                    }}
                    className="px-2 py-1 border rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
