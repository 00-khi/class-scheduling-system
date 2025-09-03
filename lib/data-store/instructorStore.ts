import { IInstructor } from "@/types/index";

const instructors: IInstructor[] = [
  {
    _id: "1",
    name: "Jumar Bibal",
    academicQualificationId: "1",
    status: "Part-Time",
  },
  {
    _id: "2",
    name: "Kyla Sinforoso",
    academicQualificationId: "2",
    status: "Part-Time",
  },
  {
    _id: "3",
    name: "Anjelah Bobiles",
    academicQualificationId: "1",
    status: "Part-Time",
  },
  {
    _id: "4",
    name: "Khian Carasicas",
    academicQualificationId: "2",
    status: "Part-Time",
  },
  {
    _id: "5",
    name: "Prince Olaguera",
    academicQualificationId: "10",
    status: "Full-Time",
  },
  {
    _id: "6",
    name: "John Lloyd Besmonte",
    academicQualificationId: "6",
    status: "Full-Time",
  },
  {
    _id: "7",
    name: "Mark Daniel Bragais",
    academicQualificationId: "7",
    status: "Full-Time",
  },
  {
    _id: "8",
    name: "Roel Albert Villaluz",
    academicQualificationId: "4",
    status: "Full-Time",
  },
  {
    _id: "9",
    name: "Guilan Josh Miranda",
    academicQualificationId: "9",
    status: "Full-Time",
  },
  {
    _id: "10",
    name: "Ar-Jay Conradez",
    academicQualificationId: "5",
    status: "Full-Time",
  },
  {
    _id: "11",
    name: "Leonard Hilig",
    academicQualificationId: "3",
    status: "Full-Time",
  },
  {
    _id: "12",
    name: "Vince Lander",
    academicQualificationId: "3",
    status: "Full-Time",
  },
  {
    _id: "13",
    name: "Shane Jude Ballon",
    academicQualificationId: "8",
    status: "Full-Time",
  },
  {
    _id: "14",
    name: "Ysahmuel Andrei Honra",
    academicQualificationId: "11",
    status: "Full-Time",
  },
  {
    _id: "15",
    name: "Khen Nuarin",
    academicQualificationId: "4",
    status: "Full-Time",
  },
];

export function getInstructorStore() {
  return instructors;
}