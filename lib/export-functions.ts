import { csvExport } from "./export-csv";

export function exportSectionSchedule(data: any[]) {
  csvExport({
    data,
    fileName: "Section-Schedules",
    groupBy: (item) => item.section.name,
    columns: [
      { header: "Section", key: "section.name", width: 15 },
      { header: "Subject", key: "subject.name", width: 35 },
      { header: "Day", key: "day", width: 12 },
      { header: "Start", key: "startTime", width: 10 },
      { header: "End", key: "endTime", width: 10 },
      { header: "Room", key: "room.name", width: 15 },
      {
        header: "Instructor",
        key: "scheduledInstructor.instructor.name",
        width: 25,
      },
    ],
    sortByKey: "subject.name",
  });
}

export function exportRoomSchedule(data: any[]) {
  csvExport({
    data,
    fileName: "Room-Schedules",
    groupBy: (item) => item.room.name,
    columns: [
      { header: "Room", key: "room.name", width: 15 },
      { header: "Section", key: "section.name", width: 15 },
      { header: "Subject", key: "subject.name", width: 35 },
      { header: "Day", key: "day", width: 12 },
      { header: "Start", key: "startTime", width: 10 },
      { header: "End", key: "endTime", width: 10 },
      {
        header: "Instructor",
        key: "scheduledInstructor.instructor.name",
        width: 25,
      },
    ],
  });
}

export function exportInstructorSchedule(data: any[]) {
  csvExport({
    data,
    fileName: "Instructor-Schedules",
    groupBy: (item) => item.instructor.name,
    columns: [
      { header: "Instructor", key: "instructor.name", width: 20 },
      { header: "Section", key: "scheduledSubject.section.name", width: 15 },
      { header: "Subject", key: "scheduledSubject.subject.name", width: 35 },
      { header: "Day", key: "scheduledSubject.day", width: 12 },
      { header: "Start", key: "scheduledSubject.startTime", width: 10 },
      { header: "End", key: "scheduledSubject.endTime", width: 10 },
      { header: "Room", key: "scheduledSubject.room.name", width: 15 },
    ],
  });
}
