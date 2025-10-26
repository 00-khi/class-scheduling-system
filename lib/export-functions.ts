import { xlsxExport } from "./export-xlsx";
import { AVAILABLE_DAYS, formatTime, toMinutes } from "./schedule-utils";

export function exportSectionSchedule(data: any[]) {
  const sortedByDayAndTime = data.sort((a, b) => {
    const dayDiff =
      AVAILABLE_DAYS.indexOf(a.day) - AVAILABLE_DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  const formatted = sortedByDayAndTime.map((item) => ({
    ...item,
    startTime: formatTime(item.startTime),
    endTime: formatTime(item.endTime),
  }));

  xlsxExport({
    data: formatted,
    fileName: "Section-Schedules",
    groupBy: (item) => item.section.name,
    columns: [
      { header: "Section", key: "section.name", width: 15 },
      { header: "Subject", key: "subject.name", width: 35 },
      { header: "Day", key: "day", width: 15 },
      { header: "Start", key: "startTime", width: 12 },
      { header: "End", key: "endTime", width: 12 },
      { header: "Room", key: "room.name", width: 15 },
      {
        header: "Instructor",
        key: "scheduledInstructor.instructor.name",
        width: 35,
      },
    ],
  });
}

export function exportRoomSchedule(data: any[]) {
  const sortedByDayAndTime = data.sort((a, b) => {
    const dayDiff =
      AVAILABLE_DAYS.indexOf(a.day) - AVAILABLE_DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  const formatted = sortedByDayAndTime
    .map((item) => ({
      ...item,
      startTime: formatTime(item.startTime),
      endTime: formatTime(item.endTime),
    }))
    .sort((a, b) => {
      const dayDiff =
        AVAILABLE_DAYS.indexOf(a.day) - AVAILABLE_DAYS.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;

      // compare by start time (HH:mm)
      const timeA = toMinutes(a.startTime);
      const timeB = toMinutes(b.startTime);
      return timeA - timeB;
    });

  xlsxExport({
    data: formatted,
    fileName: "Room-Schedules",
    groupBy: (item) => item.room.name,
    columns: [
      { header: "Room", key: "room.name", width: 15 },
      { header: "Day", key: "day", width: 15 },
      { header: "Start", key: "startTime", width: 12 },
      { header: "End", key: "endTime", width: 12 },
      { header: "Section", key: "section.name", width: 15 },
      { header: "Subject", key: "subject.name", width: 35 },
      {
        header: "Instructor",
        key: "scheduledInstructor.instructor.name",
        width: 35,
      },
    ],
  });
}

export function exportInstructorSchedule(data: any[]) {
  const sortedByDayAndTime = data.sort((a, b) => {
    const dayDiff =
      AVAILABLE_DAYS.indexOf(a.scheduledSubject.day) -
      AVAILABLE_DAYS.indexOf(b.scheduledSubject.day);
    if (dayDiff !== 0) return dayDiff;
    return (
      toMinutes(a.scheduledSubject.startTime) -
      toMinutes(b.scheduledSubject.startTime)
    );
  });

  const formatted = sortedByDayAndTime
    .map((item) => ({
      ...item,
      scheduledSubject: {
        ...item.scheduledSubject,
        startTime: formatTime(item.scheduledSubject.startTime),
        endTime: formatTime(item.scheduledSubject.endTime),
      },
    }))
    .sort((a, b) => {
      const dayDiff =
        AVAILABLE_DAYS.indexOf(a.scheduledSubject.day) -
        AVAILABLE_DAYS.indexOf(b.scheduledSubject.day);
      if (dayDiff !== 0) return dayDiff;

      const timeA = toMinutes(a.scheduledSubject.startTime);
      const timeB = toMinutes(b.scheduledSubject.startTime);
      return timeA - timeB;
    });

  xlsxExport({
    data: formatted,
    fileName: "Instructor-Schedules",
    groupBy: (item) => item.instructor.name,
    columns: [
      { header: "Instructor", key: "instructor.name", width: 30 },
      { header: "Section", key: "scheduledSubject.section.name", width: 15 },
      { header: "Subject", key: "scheduledSubject.subject.name", width: 35 },
      { header: "Day", key: "scheduledSubject.day", width: 15 },
      { header: "Start", key: "scheduledSubject.startTime", width: 12 },
      { header: "End", key: "scheduledSubject.endTime", width: 12 },
      { header: "Room", key: "scheduledSubject.room.name", width: 20 },
    ],
  });
}
