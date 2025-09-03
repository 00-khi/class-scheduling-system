import { IRoom } from "@/types";

const rooms: IRoom[] = [
  { _id: "1", name: "201", type: "Lecture" },
  { _id: "2", name: "202", type: "Lecture" },
  { _id: "3", name: "203", type: "Lecture" },
  { _id: "4", name: "204", type: "Lecture" },
  { _id: "5", name: "205", type: "Lecture" },
  { _id: "6", name: "206", type: "Lecture" },
  { _id: "7", name: "207", type: "Lecture" },
  { _id: "8", name: "208", type: "Lecture" },
  { _id: "9", name: "209", type: "Lecture" },
  { _id: "10", name: "210", type: "Lecture" },
  { _id: "11", name: "211", type: "Lecture" },
  { _id: "12", name: "212", type: "Lecture" },
  { _id: "13", name: "301", type: "Lecture" },
  { _id: "14", name: "302", type: "Lecture" },
  { _id: "15", name: "303", type: "Lecture" },
  { _id: "16", name: "304", type: "Lecture" },
  { _id: "17", name: "305", type: "Lecture" },
  { _id: "18", name: "306", type: "Lecture" },
  { _id: "19", name: "LAB A", type: "Laboratory" },
  { _id: "20", name: "LAB B", type: "Laboratory" },
  { _id: "21", name: "LAB c", type: "Laboratory" },
  { _id: "22", name: "LAB D", type: "Laboratory" },
  { _id: "23", name: "TECHLAB A", type: "Laboratory" },
  { _id: "24", name: "TECHLAB B", type: "Laboratory" },
  { _id: "25", name: "CHEMLAB", type: "Laboratory" },
  { _id: "26", name: "KITCHEN", type: "Laboratory" },
  { _id: "27", name: "MOCK HOTEL", type: "Laboratory" },
  { _id: "28", name: "DINING", type: "Lecture" },
  { _id: "29", name: "CNFRNCE", type: "Laboratory" },
  { _id: "30", name: "HALL1", type: "Lecture" },
  { _id: "31", name: "HALL2", type: "Lecture" },
  { _id: "32", name: "MHSU1", type: "Laboratory" },
  { _id: "33", name: "RM101", type: "Lecture" },
  { _id: "34", name: "OFCR1", type: "Lecture" },
];

export function getRoomStore() {
  return rooms;
}