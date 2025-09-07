import { IAcademicLevel } from "@/types";

const academicLevels: IAcademicLevel[] = [
    { id: "1", code: "JHS", name: "Junior Highschool" },
    { id: "2", code: "SHS", name: "Senior Highschool" },
    { id: "3", code: "TER", name: "Tertiary" }
]

export function getAcademicLevelStore() {
  return academicLevels
}