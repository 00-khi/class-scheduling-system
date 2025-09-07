"use client";

import { useMemo, useState } from "react";
import SelectSection from "@/ui/components/select-section";
import { ScheduledSubjectsTable } from "./test-scheduled-subjects-table";
import { CustomScheduleTable } from "./test-custom-schedule-table";
import { getScheduledSubjects } from "@/services/scheduledSubjectService";
import {
  getAssignedSubjectById,
  getAssignedSubjects,
} from "@/services/assignedSubjectService";
import { IAssignedSubject, IScheduledSubject } from "@/types";

export default function CustomScheduleClient() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [customList, setCustomList] = useState<IScheduledSubject[]>([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const triggerRefresh = () => setRefreshKey((p) => p + 1);

  const allScheduled = useMemo(() => {
    return getScheduledSubjects();
  }, [refreshKey]);

  // scheduled subjects filtered by selected section
  const scheduledForSection = useMemo(() => {
    if (!selectedSection) return [];
    return allScheduled.filter((s) => {
      const asg = getAssignedSubjectById(s.assignedSubjectId) as
        | IAssignedSubject
        | undefined;
      return asg?.sectionId === selectedSection;
    });
  }, [allScheduled, selectedSection]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block mb-1">Section</label>
        <SelectSection onSectionChange={setSelectedSection} />
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <div>
          <h3 className="text-lg mb-2">Available Scheduled Subjects</h3>
          <ScheduledSubjectsTable
            scheduled={scheduledForSection}
            onAdd={(s) => {
              // parent will handle conflict logic inside add handler
              setCustomList((prev) => [...prev, s]);
            }}
            refreshKey={refreshKey}
            triggerRefresh={triggerRefresh}
          />
        </div>

        <div>
          <h3 className="text-lg mb-2">Custom Schedule</h3>
          <CustomScheduleTable
            title={title}
            note={note}
            onTitleChange={setTitle}
            onNoteChange={setNote}
            items={customList}
            onRemove={(id) =>
              setCustomList((p) => p.filter((x) => x.id !== id))
            }
            onReplaceList={(list) => setCustomList(list)}
          />
        </div>
      </div>
    </div>
  );
}
