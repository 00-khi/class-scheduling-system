import { ICourse } from "@/types/index";

const courses: ICourse[] = [
  {
    _id: "1",
    code: "G-JHS",
    name: "Junior Highschool Grade Levels",
    academicLevelId: "1",
    yearLevels: [
      {
        _id: "1",
        name: "Grade 7",
        code: "G7",
      },
      {
        _id: "2",
        name: "Grade 8",
        code: "G8",
      },
      {
        _id: "3",
        name: "Grade 9",
        code: "G9",
      },
      {
        _id: "4",
        name: "Grade 10",
        code: "G10",
      },
    ],
  },
  {
    _id: "2",
    code: "STEM",
    name: "Science, Technology, Engineering, and Mathematics",
    academicLevelId: "2",
    yearLevels: [
      {
        _id: "1",
        name: "Grade 11",
        code: "G11",
      },
      {
        _id: "2",
        name: "Grade 12",
        code: "G12",
      },
    ],
  },
  {
    _id: "3",
    code: "ABM",
    name: "Accountancy, Business, and Management",
    academicLevelId: "2",
    yearLevels: [
      {
        _id: "1",
        name: "Grade 11",
        code: "G11",
      },
      {
        _id: "2",
        name: "Grade 12",
        code: "G12",
      },
    ],
  },
  {
    _id: "4",
    code: "HUMSS",
    name: "Humanities and Social Sciences",
    academicLevelId: "2",
    yearLevels: [
      {
        _id: "1",
        name: "Grade 11",
        code: "G11",
      },
      {
        _id: "2",
        name: "Grade 12",
        code: "G12",
      },
    ],
  },
  {
    _id: "5",
    code: "ITMAWD",
    name: "IT in Mobile App and Web Development",
    academicLevelId: "2",
    yearLevels: [
      {
        _id: "1",
        name: "Grade 11",
        code: "G11",
      },
      {
        _id: "2",
        name: "Grade 12",
        code: "G12",
      },
    ],
  },
  {
    _id: "6",
    code: "BSAIS",
    name: "Bachelor of Science in Accounting Information System",
    academicLevelId: "3",
    yearLevels: [
      {
        _id: "1",
        name: "1st Year",
        code: "Y1",
      },
      {
        _id: "2",
        name: "2nd Year",
        code: "Y2",
      },
      {
        _id: "3",
        name: "3rd Year",
        code: "Y3",
      },
      {
        _id: "4",
        name: "4th Year",
        code: "Y4",
      },
    ],
  },
  {
    _id: "7",
    code: "BSBA",
    name: "Bachelor of Science in Business Administration",
    academicLevelId: "3",
    yearLevels: [
      {
        _id: "1",
        name: "1st Year",
        code: "Y1",
      },
      {
        _id: "2",
        name: "2nd Year",
        code: "Y2",
      },
      {
        _id: "3",
        name: "3rd Year",
        code: "Y3",
      },
      {
        _id: "4",
        name: "4th Year",
        code: "Y4",
      },
    ],
  },
  {
    _id: "8",
    code: "BSCpe",
    name: "Bachelor of Science in Computer Engineering",
    academicLevelId: "3",
    yearLevels: [
      {
        _id: "1",
        name: "1st Year",
        code: "Y1",
      },
      {
        _id: "2",
        name: "2nd Year",
        code: "Y2",
      },
      {
        _id: "3",
        name: "3rd Year",
        code: "Y3",
      },
      {
        _id: "4",
        name: "4th Year",
        code: "Y4",
      },
    ],
  },
  {
    _id: "9",
    code: "BSHM",
    name: "Bachelor of Science in Hospitality Management",
    academicLevelId: "3",
    yearLevels: [
      {
        _id: "1",
        name: "1st Year",
        code: "Y1",
      },
      {
        _id: "2",
        name: "2nd Year",
        code: "Y2",
      },
      {
        _id: "3",
        name: "3rd Year",
        code: "Y3",
      },
      {
        _id: "4",
        name: "4th Year",
        code: "Y4",
      },
    ],
  },
  {
    _id: "10",
    code: "BSIT",
    name: "Bachelor of Science in Information Technology",
    academicLevelId: "3",
    yearLevels: [
      {
        _id: "1",
        name: "1st Year",
        code: "Y1",
      },
      {
        _id: "2",
        name: "2nd Year",
        code: "Y2",
      },
      {
        _id: "3",
        name: "3rd Year",
        code: "Y3",
      },
      {
        _id: "4",
        name: "4th Year",
        code: "Y4",
      },
    ],
  },
];

export function getCourseStore() {
  return courses;
}
