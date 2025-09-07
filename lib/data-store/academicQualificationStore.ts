import { IAcademicQualification } from "@/types/index";

const academicQualifications: IAcademicQualification[] = [
  { id: "1", name: "Mathematics", code: "MATH" },
  { id: "2", name: "Social Studies", code: "SOCST" },
  { id: "3", name: "Information Technology", code: "IT" },
  { id: "4", name: "Entrepreneurship", code: "ENTREP" },
  { id: "5", name: "Accountancy", code: "ACC" },
  { id: "6", name: "Hospitality Management", code: "HM" },
  { id: "7", name: "Science", code: "SCI" },
  { id: "8", name: "Bussiness Administration", code: "BA" },
  { id: "9", name: "English", code: "ENG" },
  { id: "10", name: "Computer Engineering", code: "CPE" },
  { id: "11", name: "Managerial Accounting", code: "MACC" },
  { id: "12", name: "Filipino", code: "FIL" },
  { id: "13", name: "Computer Science", code: "CS" },
  { id: "14", name: "Food & Service Management", code: "FSM" },
  { id: "15", name: "Foreign Language", code: "FL" },
  { id: "16", name: "Tourism Management", code: "TM" },
  { id: "17", name: "Law", code: "LAW" },
  { id: "18", name: "Physical Education", code: "PE" },
  { id: "19", name: "Chemical Engineering", code: "CHEME" },
];

export function getAcademicQualificationStore() {
  return academicQualifications;
}
