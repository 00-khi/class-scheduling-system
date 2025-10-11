"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import { ROOMS_API } from "@/lib/api/api-endpoints";
import {
  Room,
  ScheduledSubject,
  Subject,
  Section,
  Instructor,
} from "@prisma/client";
import { useEffect } from "react";
import { Card } from "@/ui/shadcn/card";
import Timetable from "@/ui/components/timetable";
import TimetableSkeleton from "@/ui/components/timetable-skeleton";

export type ScheduledSubjectRow = ScheduledSubject & {
  scheduledInstructor: {
    instructor: Instructor;
  };
  subject: Subject;
  section: Section;
};

export default function RoomTimetable({
  roomId,
  refreshKey,
}: {
  roomId: number;
  refreshKey: number;
}) {
  const roomApi = createApiClient<ScheduledSubjectRow>(
    `${ROOMS_API}/${roomId}/schedules`
  );

  const entityManagement = useManageEntities<ScheduledSubjectRow>({
    apiService: { fetch: roomApi.getAll },
  });

  useEffect(() => {
    entityManagement.fetchData();
  }, [roomId, refreshKey]);

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
