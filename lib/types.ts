import { InstructorStatus } from "@prisma/client";

export type TAcademicQualification = {
  id: number;
  code: string; // e.g., "IT", "HM"
  name: string; // e.g., "Information Technology", "Hospitality Management"
};

export type TInstructor = {
  id: number;
  name: string; // e.g., "Lebrawn Hayme"
  academicQualificationId: number; // ID of the academic qualification this instructor belongs to
  status: InstructorStatus;
};

export type TAcademicLevel = {
  id: string;
  code: string; // e.g., "JHS", "SHS", "TER"
  name: string; // e.g., "Junior High School", "Senior High School", "Tertiary"
  years: number[]; // e.g., [7, 8, 9, 10]
};

// export type TRoom = {
//   id?: string;
//   name: string; // e.g., "Room 101", "Lab A", "Gym 1"
//   type: "Lecture" | "Laboratory";
// };

// export type TCourse = {
//   id?: string;
//   code: string; // e.g., "BSIT", "BSA", "BSED", "JHS-GL"
//   name: string; // e.g., "Bachelor of Science in Information Technology", "Bachelor of Science in Accountancy", "Bachelor of Secondary Education", "Junior High School Grade Levels"
//   academicLevelId: string; // ID of the academic level this course belongs to
//   yearLevels: IYearLevel[]; // Array of year levels, e.g., [{ id: "1", name: "1st Year", code: "Y1" }, { id: "2", name: "Grade 7", code: "G7" }]
// };

// // wag mo na to lagyan ng service tas data store
// // only represents in a course
// export type TYearLevel = {
//   id?: string;
//   name: string;
//   code: string;
// };

// export type TSection = {
//   id?: string;
//   name: string; // e.g., "BSIT101A", "MWA101A"
//   academicLevelId: string; // ID of the academic level this section belongs to
//   courseId: string; // ID of the course this section belongs to
//   yearLevelId: string; // ID of the year level inside the course
// };

// export type TSubject = {
//   id?: string;
//   code: string; // e.g., "CS101", "MATH101", "ENG101"
//   title: string; // e.g., "Introduction to Computer Science", "Calculus I", "English Literature"
//   type: "Lecture" | "Laboratory";
//   units: number; // e.g., 3 for lecture, 1 for laboratory
//   academicLevelId: string; // ID of the academic level this subject belongs to
//   courseId: string; // ID of the course this subject belongs to
//   yearLevelId: string; // ID of the year level inside the course
//   semester: string; // e.g., "1st Semester", "2nd Semester"
// };

// // -------------------- RELATIONSHIPS --------------------

// export type TAssignedSubject = {
//   id?: string;
//   subjectId: string; // Links to subject ID, e.g. subject "3" assigned to section "2"
//   sectionId: string; // Links to section ID this assigned subject belongs to
// };

// export type TScheduledSubject = {
//   id?: string;
//   assignedSubjectId: string; // Links to assigned subject this scheduled subject belongs to
//   roomId: string; // ID of the room this scheduled subject belongs to
//   dayOfWeek: string; // e.g., 0 = Sunday, 1 = Monday, etc.
//   startTime: string; // e.g. "14:00"
//   endTime: string; // e.g. "15:00"
// };

// export type TScheduleOfInstructor = {
//   id?: string;
//   assignedSubjectId: string; // Links to assigned subject this assigned instructor belongs to
//   instructorId: string; // Links to instructor this schedule of intructor ha ano daw, naubusan na ko ng english
// };
