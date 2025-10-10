import { Day, Room, RoomType, ScheduledSubject, Subject } from "@prisma/client";
import {
  AVAILABLE_DAYS,
  DAY_START,
  DAY_END,
  toMinutes,
  toTime,
  diffMinutes,
  isSectionAndRoomConflict,
} from "./schedule-utils";

////////////////////////////

type SubjectWithSchedule = {
  id: number;
  code?: string;
  name?: string;
  semester?: string;
  units: number;
  type: RoomType;
  scheduledSubject?: {
    id?: number;
    startTime: string;
    endTime: string;
    day: Day;
    sectionId: number;
    roomId: number;
    subjectId: number;
  }[];
  scheduledMinutes: number;
  requiredMinutes: number;
  academicLevelId?: number;
};

type ExistingSchedule = {
  id?: number;
  startTime: string;
  endTime: string;
  day: Day;
  sectionId: number;
  roomId: number;
  subjectId: number;
};

type NewSchedule = {
  startTime: string;
  endTime: string;
  day: Day;
  sectionId: number;
  roomId: number;
  subjectId: number;
};

type AutoScheduleOptions = {
  stepMinutes?: 30;
  attemptsPerSession?: number;
  days?: string[];
  roomPicker?: (room: Room, subject: SubjectWithSchedule) => boolean;
};

type AutoScheduleResult = {
  newSchedules: NewSchedule[];
  report: {
    subjectId: number;
    scheduledMinutesBefore: number;
    scheduledMinutesAfter: number;
    createdSessions: number;
    failed?: string;
  }[];
};

////////////////////////////
// helper: split into sessions
function splitIntoSessions(requiredMinutes: number): number[] {
  if (requiredMinutes <= 60) return [requiredMinutes];

  if (requiredMinutes % 90 === 0) {
    return Array(requiredMinutes / 90).fill(90);
  }
  if (requiredMinutes % 120 === 0) {
    return Array(requiredMinutes / 120).fill(120);
  }

  const sessions: number[] = [];
  let remaining = requiredMinutes;

  while (remaining > 0) {
    if (remaining <= 90 && remaining >= 60) {
      sessions.push(remaining);
      break;
    } else {
      sessions.push(60);
      remaining -= 60;
    }
  }
  return sessions;
}

////////////////////////////
export function autoScheduleSubjects(
  subjects: SubjectWithSchedule[],
  existingSchedules: ExistingSchedule[],
  rooms: Room[],
  sectionId: number,
  opts?: AutoScheduleOptions
): AutoScheduleResult {
  const stepMinutes = opts?.stepMinutes ?? 30;
  const attemptsPerSession = opts?.attemptsPerSession ?? 200;
  const days = opts?.days ?? AVAILABLE_DAYS.map(String);

  function buildPossibleStartMinutes(sessionMinutes: number): number[] {
    const startMin = toMinutes(DAY_START);
    const endMin = toMinutes(DAY_END);
    const latestStart = endMin - sessionMinutes;
    const slots: number[] = [];
    for (let t = startMin; t <= latestStart; t += stepMinutes) {
      slots.push(t);
    }
    return slots;
  }

  const pickRandom = <T,>(arr: T[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  const existingCopy: ExistingSchedule[] = existingSchedules.slice();
  const created: NewSchedule[] = [];
  const report: AutoScheduleResult["report"] = [];

  for (const subj of subjects) {
    const subjectId = subj.id;
    const before = subj.scheduledMinutes ?? 0;
    let remaining = Math.max(
      0,
      (subj.requiredMinutes ?? subj.units * 60) - (subj.scheduledMinutes ?? 0)
    );

    const sessions = splitIntoSessions(remaining);

    const matchingRooms = rooms.filter((r) =>
      opts?.roomPicker ? opts.roomPicker(r, subj) : r.type === subj.type
    );
    if (matchingRooms.length === 0) {
      report.push({
        subjectId,
        scheduledMinutesBefore: before,
        scheduledMinutesAfter: before,
        createdSessions: 0,
        failed: `No rooms for type ${subj.type}`,
      });
      continue;
    }

    let createdCount = 0;
    let scheduledNow = 0;

    for (const sessionMinutes of sessions) {
      let scheduledThisSession = false;

      const possibleStarts = buildPossibleStartMinutes(sessionMinutes);
      if (possibleStarts.length === 0) {
        continue;
      }

      for (let attempt = 0; attempt < attemptsPerSession; attempt++) {
        const day = pickRandom(days) as Day;
        const startMin = pickRandom(possibleStarts);
        const endMin = startMin + sessionMinutes;

        const startTime = toTime(startMin);
        const endTime = toTime(endMin);
        const room = pickRandom(matchingRooms);

        const candidate: ExistingSchedule = {
          startTime,
          endTime,
          day,
          sectionId,
          roomId: room.id,
          subjectId,
        };

        const allExisting = existingCopy.concat(
          created.map((c) => ({
            startTime: c.startTime,
            endTime: c.endTime,
            day: c.day as Day,
            sectionId: c.sectionId,
            roomId: c.roomId,
            subjectId: c.subjectId,
          }))
        );

        if (!isSectionAndRoomConflict(candidate as any, allExisting as any)) {
          const newSched: NewSchedule = {
            startTime,
            endTime,
            day,
            sectionId,
            roomId: room.id,
            subjectId,
          };
          created.push(newSched);
          existingCopy.push(newSched);
          remaining -= sessionMinutes;
          createdCount++;
          scheduledNow += sessionMinutes;
          scheduledThisSession = true;
          break;
        }
      }

      if (!scheduledThisSession) {
        break;
      }
    }

    const after = before + scheduledNow;
    report.push({
      subjectId,
      scheduledMinutesBefore: before,
      scheduledMinutesAfter: after,
      createdSessions: createdCount,
      failed: remaining > 0 ? `${remaining} mins not scheduled` : undefined,
    });
  }

  return { newSchedules: created, report };
}
