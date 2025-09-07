import { IScheduledSubject } from "@/types";

const scheduledSubjects: IScheduledSubject[] = [
  // {
  //   id: "1",
  //   assignedSubjectId: "1",
  //   roomId: "1",
  //   dayOfWeek: "1",
  //   startTime: "07:30",
  //   endTime: "08:30",
  // },
  // {
  //   id: "2",
  //   assignedSubjectId: "2",
  //   roomId: "2",
  //   dayOfWeek: "2",
  //   startTime: "09:30",
  //   endTime: "10:00",
  // },
  // {
  //   id: "3",
  //   assignedSubjectId: "3",
  //   roomId: "1",
  //   dayOfWeek: "3",
  //   startTime: "12:00",
  //   endTime: "13:30",
  // },
  // {
  //   id: "4",
  //   assignedSubjectId: "4",
  //   roomId: "4",
  //   dayOfWeek: "4",
  //   startTime: "11:30",
  //   endTime: "13:30",
  // },
  // {
  //   id: "5",
  //   assignedSubjectId: "5",
  //   roomId: "2",
  //   dayOfWeek: "5",
  //   startTime: "15:00",
  //   endTime: "16:30",
  // },
  // {
  //   id: "6",
  //   assignedSubjectId: "6",
  //   roomId: "3",
  //   dayOfWeek: "1",
  //   startTime: "07:30",
  //   endTime: "10:30",
  // },
  // {
  //   id: "7",
  //   assignedSubjectId: "7",
  //   roomId: "5",
  //   dayOfWeek: "2",
  //   startTime: "12:00",
  //   endTime: "13:30",
  // },
  // {
  //   id: "8",
  //   assignedSubjectId: "8",
  //   roomId: "3",
  //   dayOfWeek: "3",
  //   startTime: "08:00",
  //   endTime: "11:00",
  // },
];

export function getScheduledSubjectStore() {
  return scheduledSubjects;
}
