"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import { SECTIONS_API } from "@/lib/api/api-endpoints";
import { Room, ScheduledSubject, Subject } from "@prisma/client";
import { useEffect } from "react";
import Timetable from "./components/timetable";
import { Card } from "@/ui/shadcn/card";

export type ScheduledSubjectRow = ScheduledSubject & {
  room: Room;
  subject: Subject;
};

export default function TimetableManager({
  sectionId,
  refreshKey,
}: {
  sectionId: number;
  refreshKey: number;
}) {
  const subjectApi = createApiClient<ScheduledSubjectRow>(
    `${SECTIONS_API}/${sectionId}/schedules`
  );

  const entityManagement = useManageEntities<ScheduledSubjectRow>({
    apiService: { fetch: subjectApi.getAll },
  });

  useEffect(() => {
    entityManagement.fetchData();
  }, [sectionId, refreshKey]);

  return (
    <Card className="p-0 gap-0">
      <Timetable scheduled={entityManagement.data} />
    </Card>
  );
}
