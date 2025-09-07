import { IRoom } from "@/types";

const rooms: IRoom[] = [
  { id: "1", name: "201", type: "Lecture" },
  { id: "2", name: "202", type: "Lecture" },
  { id: "3", name: "203", type: "Lecture" },
  { id: "4", name: "204", type: "Lecture" },
  { id: "5", name: "205", type: "Lecture" },
  { id: "6", name: "206", type: "Lecture" },
  { id: "7", name: "207", type: "Lecture" },
  { id: "8", name: "208", type: "Lecture" },
  { id: "9", name: "209", type: "Lecture" },
  { id: "10", name: "210", type: "Lecture" },
  { id: "11", name: "211", type: "Lecture" },
  { id: "12", name: "212", type: "Lecture" },
  { id: "13", name: "301", type: "Lecture" },
  { id: "14", name: "302", type: "Lecture" },
  { id: "15", name: "303", type: "Lecture" },
  { id: "16", name: "304", type: "Lecture" },
  { id: "17", name: "305", type: "Lecture" },
  { id: "18", name: "306", type: "Lecture" },
  { id: "19", name: "LAB A", type: "Laboratory" },
  { id: "20", name: "LAB B", type: "Laboratory" },
  { id: "21", name: "LAB c", type: "Laboratory" },
  { id: "22", name: "LAB D", type: "Laboratory" },
  { id: "23", name: "TECHLAB A", type: "Laboratory" },
  { id: "24", name: "TECHLAB B", type: "Laboratory" },
  { id: "25", name: "CHEMLAB", type: "Laboratory" },
  { id: "26", name: "KITCHEN", type: "Laboratory" },
  { id: "27", name: "MOCK HOTEL", type: "Laboratory" },
  { id: "28", name: "DINING", type: "Lecture" },
  { id: "29", name: "CNFRNCE", type: "Laboratory" },
  { id: "30", name: "HALL1", type: "Lecture" },
  { id: "31", name: "HALL2", type: "Lecture" },
  { id: "32", name: "MHSU1", type: "Laboratory" },
  { id: "33", name: "RM101", type: "Lecture" },
  { id: "34", name: "OFCR1", type: "Lecture" },
];

export function getRoomStore() {
  return rooms;
}