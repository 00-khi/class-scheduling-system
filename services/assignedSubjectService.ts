import { IAssignedSubject } from "@/types";
import { getAssignedSubjectStore } from "@/lib/data-store/assignedSubjectStore";

export function getAssignedSubjects(): IAssignedSubject[] {
  return [...getAssignedSubjectStore()];
}

export function getAssignedSubjectById(
  id: string
): IAssignedSubject | undefined {
  const assignedSubjects = getAssignedSubjectStore();
  return assignedSubjects.find((assignedSubject) => assignedSubject.id === id);
}

export function addAssignedSubject(
  assignedSubject: Omit<IAssignedSubject, "id">
): IAssignedSubject {
  const newAssignedSubject = { ...assignedSubject, id: Date.now().toString() };
  getAssignedSubjectStore().push(newAssignedSubject);
  return newAssignedSubject;
}

export function updateAssignedSubject(
  id: string,
  updates: Partial<IAssignedSubject>
): IAssignedSubject | null {
  const assignedSubjects = getAssignedSubjectStore();
  const index = assignedSubjects.findIndex(
    (assignedSubject) => assignedSubject.id === id
  );
  if (index === -1) return null;
  assignedSubjects[index] = { ...assignedSubjects[index], ...updates };
  return assignedSubjects[index];
}

export function deleteAssignedSubject(id: string): boolean {
  const assignedSubjects = getAssignedSubjectStore();
  const index = assignedSubjects.findIndex(
    (assignedSubject) => assignedSubject.id === id
  );
  if (index === -1) return false;
  assignedSubjects.splice(index, 1);
  return true;
}
