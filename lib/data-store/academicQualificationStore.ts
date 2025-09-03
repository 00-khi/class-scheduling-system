import { IAcademicQualification } from "@/types/index";

const academicQualifications: IAcademicQualification[] = [
  { _id: "1", name: "How Much", code: "HM" },
  { _id: "2", name: "International Tambay", code: "IT" },
  { _id: "3", name: "Engineering", code: "ENGR" },
  { _id: "4", name: "Business and Management", code: "BM" },
  { _id: "5", name: "English", code: "ENG" },
  { _id: "6", name: "Mathematics", code: "MATH" },
  { _id: "7", name: "Physical Education", code: "PE" },
  { _id: "8", name: "Accounting", code: "ACC" },
  { _id: "9", name: "Social and Behavioral Science", code: "SBS" },
  { _id: "10", name: "Law", code: "LAW" },
  { _id: "11", name: "Foreign Language", code: "FL" },
];

export function getAcademicQualificationStore() {
  return academicQualifications
}