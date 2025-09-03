import { IInstructor } from "@/types/index";

const instructors: IInstructor[] = [
  {
    _id: "1",
    name: "Jumar Bibal",
    academicQualificationId: "1",
    status: "PT",
  },
  {
    _id: "2",
    name: "Kyla Sinforoso",
    academicQualificationId: "2",
    status: "FT",
  },
  {
    _id: "3",
    name: "Anjelah Bobiles",
    academicQualificationId: "1",
    status: "PROBY",
  },
  {
    _id: "4",
    name: "Khian Carasicas",
    academicQualificationId: "2",
    status: "PTFL",
  },
];

export function getInstructorStore() {
  return instructors;
}
