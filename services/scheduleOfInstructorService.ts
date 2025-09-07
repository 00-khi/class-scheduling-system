import { IScheduleOfInstructor } from "@/types";
import { getScheduledOfInstructorStore } from "@/lib/data-store/scheduleOfInstructorStore";

export function getScheduleOfInstructors(): IScheduleOfInstructor[] {
  return [...getScheduledOfInstructorStore()];
}

export function getScheduleOfInstructorById(
  id: string
): IScheduleOfInstructor | undefined {
  const scheduledOfInstructors = getScheduledOfInstructorStore();
  return scheduledOfInstructors.find((item) => item.id === id);
}

export function addScheduleOfInstructor(
  scheduledOfInstructor: Omit<IScheduleOfInstructor, "id">
): IScheduleOfInstructor {
  const newScheduledOfInstructor = {
    ...scheduledOfInstructor,
    id: Date.now().toString(),
  };
  getScheduledOfInstructorStore().push(newScheduledOfInstructor);
  return newScheduledOfInstructor;
}

export function updateScheduleOfInstructor(
  id: string,
  updates: Partial<IScheduleOfInstructor>
): IScheduleOfInstructor | null {
  const scheduledOfInstructors = getScheduledOfInstructorStore();
  const index = scheduledOfInstructors.findIndex((item) => item.id === id);
  if (index === -1) return null;
  scheduledOfInstructors[index] = {
    ...scheduledOfInstructors[index],
    ...updates,
  };
  return scheduledOfInstructors[index];
}

export function deleteScheduleOfInstructor(id: string): boolean {
  const scheduledOfInstructors = getScheduledOfInstructorStore();
  const index = scheduledOfInstructors.findIndex((item) => item.id === id);
  if (index === -1) return false;
  scheduledOfInstructors.splice(index, 1);
  return true;
}
