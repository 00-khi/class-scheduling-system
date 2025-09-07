import { IInstructor } from "@/types";
import { getInstructorStore } from "@/lib/data-store/instructorStore";

export function getInstructors(): IInstructor[] {
  return [...getInstructorStore()];
}

export function getInstructorById(id: string): IInstructor | undefined {
  const instructors = getInstructorStore();
  return instructors.find((instructor) => instructor.id === id);
}

export function addInstructor(
  instructor: Omit<IInstructor, "id">
): IInstructor {
  const newInstructor = { ...instructor, id: Date.now().toString() };
  getInstructorStore().push(newInstructor);
  return newInstructor;
}

export function updateInstructor(
  id: string,
  updates: Partial<IInstructor>
): IInstructor | null {
  const instructors = getInstructorStore();
  const index = instructors.findIndex((instructor) => instructor.id === id);
  if (index === -1) return null;
  instructors[index] = { ...instructors[index], ...updates };
  return instructors[index];
}

export function deleteInstructor(id: string): boolean {
  const instructors = getInstructorStore();
  const index = instructors.findIndex((instructor) => instructor.id === id);
  if (index === -1) return false;
  instructors.splice(index, 1);
  return true;
}

export function getInstructorCount(): number {
  return getInstructorStore().length;
}
