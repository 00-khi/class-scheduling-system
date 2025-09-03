import { IAcademicQualification } from "@/types/index";

const academicQualifications: IAcademicQualification[] = [
  { _id: "1", name: "Mathematics", code: "MATH" },
  { _id: "2", name: "Social Studies", code: "SOCST" },
  { _id: "3", name: "Information Technology", code: "IT" },
  { _id: "4", name: "Entrepreneurship", code: "ENTREP" },
  { _id: "5", name: "Accountancy", code: "ACC" },
  { _id: "6", name: "Hospitality Management", code: "HM" },
  { _id: "7", name: "Science", code: "SCI" },
  { _id: "8", name: "Bussiness Administration", code: "BA" },
  { _id: "9", name: "English", code: "ENG" },
  { _id: "10", name: "Computer Engineering", code: "CPE" },
  { _id: "11", name: "Managerial Accounting", code: "MACC" },
  { _id: "12", name: "Filipino", code: "FIL" },
  { _id: "13", name: "Computer Science", code: "CS" },
  { _id: "14", name: "Food & Service Management", code: "FSM" },
  { _id: "15", name: "Foreign Language", code: "FL" },
  { _id: "16", name: "Tourism Management", code: "TM" },
  { _id: "17", name: "Law", code: "LAW" },
  { _id: "18", name: "Physical Education", code: "PE" },
  { _id: "19", name: "Chemical Engineering", code: "CHEME" },
];

export function getAcademicQualificationStore() {
  return academicQualifications;
}
