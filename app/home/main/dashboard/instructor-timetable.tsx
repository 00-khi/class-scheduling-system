"use client";

import { useEffect } from "react";
import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import { INSTRUCTORS_API } from "@/lib/api/api-endpoints";
import { Card } from "@/ui/shadcn/card";
import Timetable from "@/ui/components/timetable";
import TimetableSkeleton from "@/ui/components/timetable-skeleton";
import { Room, Section, Subject, ScheduledSubject } from "@prisma/client";

export type InstructorScheduleRow = ScheduledSubject & {
  room: Room;
  subject: Subject;
  section: Section;
};

export default function InstructorTimetable({
  instructorId,
  refreshKey,
}: {
  instructorId: number;
  refreshKey: number;
}) {
  const scheduleApi = createApiClient<InstructorScheduleRow>(
    `${INSTRUCTORS_API}/${instructorId}/schedules`
  );

  const entityManagement = useManageEntities<InstructorScheduleRow>({
    apiService: { fetch: scheduleApi.getAll },
  });

  useEffect(() => {
    entityManagement.fetchData();
  }, [instructorId, refreshKey]);

  return (
    <Card className="p-0 gap-0 overflow-auto">
      {entityManagement.isLoading ? (
        <TimetableSkeleton />
      ) : (
        <Timetable schedule={entityManagement.data} />
      )}
    </Card>
  );
}
