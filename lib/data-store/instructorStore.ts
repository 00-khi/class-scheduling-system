import { IInstructor } from "@/types/index";

const instructors: IInstructor[] = [
  {
    id: "1",
    name: "Jumar Bibal",
    academicQualificationId: "1",
    status: "PT",
  },
  {
    id: "2",
    name: "Kyla Sinforoso",
    academicQualificationId: "2",
    status: "FT",
  },
  {
    id: "3",
    name: "Anjelah Bobiles",
    academicQualificationId: "1",
    status: "PROBY",
  },
  {
    id: "4",
    name: "Khian Carasicas",
    academicQualificationId: "2",
    status: "PTFL",
  },
];

export function getInstructorStore() {
  return instructors;
}
