import { IRoom } from "@/types";
import { getRoomStore } from "@/lib/data-store/roomStore";

export function getRooms(): IRoom[] {
  return [...getRoomStore()];
}

export function getRoomsById(id: string): IRoom | undefined {
  const rooms = getRoomStore();
  return rooms.find((room) => room._id === id);
}

export function addRoom(room: Omit<IRoom, "_id">): IRoom {
  const newRoom = { ...room, _id: Date.now().toString() };
  getRoomStore().push(newRoom);
  return newRoom;
}

export function updateRoom(id: string, updates: Partial<IRoom>): IRoom | null {
  const rooms = getRoomStore();
  const index = rooms.findIndex((room) => room._id === id);
  if (index === -1) return null;
  rooms[index] = { ...rooms[index], ...updates };
  return rooms[index];
}

export function deleteRoom(id: string): boolean {
  const rooms = getRoomStore();
  const index = rooms.findIndex((room) => room._id === id);
  if (index === -1) return false;
  rooms.splice(index, 1);
  return true;
}

export function getRoomCount(): number {
  return getRoomStore().length;
}
