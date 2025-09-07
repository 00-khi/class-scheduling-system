"use client";

import { useMemo, useState } from "react";
import { IScheduledSubject } from "@/types";
import { getAssignedSubjectById } from "@/services/assignedSubjectService";
import { getSubjectById } from "@/services/subjectService";
import { getRooms } from "@/services/roomService";
import { overlaps } from "@/lib/scheduleUtils";
import { toast } from "sonner";

export function ScheduledSubjectsTable({
  scheduled,
  onAdd,
  refreshKey,
  triggerRefresh,
}: {
  scheduled: IScheduledSubject[];
  onAdd: (s: IScheduledSubject) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}) {
  const [filter, setFilter] = useState("");

  const rooms = useMemo(() => getRooms(), [refreshKey]);

  const rows = useMemo(() => {
    if (!filter) return scheduled;
    const q = filter.toLowerCase();
    return scheduled.filter((s) => {
      const asg = getAssignedSubjectById(s.assignedSubjectId);
      const subj = asg ? getSubjectById(asg.subjectId) : undefined;
      return (
        subj?.title.toLowerCase().includes(q) ||
        subj?.code.toLowerCase().includes(q) ||
        (s.dayOfWeek + "").includes(q)
      );
    });
  }, [scheduled, filter]);

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="text search"
          className="border rounded px-2 py-1 w-full"
        />
        <button onClick={triggerRefresh} className="border rounded px-3">
          Refresh
        </button>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No schedules</div>
        ) : (
          rows.map((r) => {
            const asg = getAssignedSubjectById(r.assignedSubjectId);
            const subj = asg ? getSubjectById(asg.subjectId) : undefined;
            const room = rooms.find((x) => x.id === r.roomId);
            return (
              <div
                key={r.id}
                className="p-2 border rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {subj ? `${subj.code} - ${subj.title}` : "Unknown subject"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Day {r.dayOfWeek}, {r.startTime} - {r.endTime},{" "}
                    {room?.name || "Unknown room"}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      onAddWithConflictCheck(r, onAdd);
                    }}
                    className="px-2 py-1 border rounded"
                  >
                    Add
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

// helper uses window level store for conflicts check, parent will still receive add
function onAddWithConflictCheck(
  item: IScheduledSubject,
  onAdd: (s: IScheduledSubject) => void
) {
  // read temporary list from a small store attached to window.
  // This keeps the conflict logic simple when user uses multiple components.
  const existing = (window as any).__customScheduleList as
    | IScheduledSubject[]
    | undefined;
  const list = existing || [];

  // check overlap within same day
  for (const s of list) {
    if (s.dayOfWeek === item.dayOfWeek) {
      if (overlaps(item.startTime, item.endTime, s.startTime, s.endTime)) {
        toast.error("Time overlaps with an item in custom schedule");
        return;
      }
    }
    // prevent duplicate identical entry
    if (
      s.assignedSubjectId === item.assignedSubjectId &&
      s.dayOfWeek === item.dayOfWeek &&
      s.startTime === item.startTime &&
      s.endTime === item.endTime
    ) {
      toast.error("Duplicate timeslot in custom schedule");
      return;
    }
  }

  // ok, push into shared window store and call parent
  const newList = [...list, item];
  (window as any).__customScheduleList = newList;
  onAdd(item);
  toast.success("Added to custom schedule");
}
