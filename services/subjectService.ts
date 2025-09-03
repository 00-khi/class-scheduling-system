import { ISubject } from "@/types";
import { getSubjectStore } from "@/lib/data-store/subjectStore";

export function getSubjects(): ISubject[] {
  return [...getSubjectStore()];
}

export function getSubjectById(id: string): ISubject | undefined {
  const subjects = getSubjectStore();
  return subjects.find((subject) => subject._id === id);
}

export function addSubject(subject: Omit<ISubject, "_id">): ISubject {
  const newSubject = { ...subject, _id: Date.now().toString() };
  getSubjectStore().push(newSubject);
  return newSubject;
}

export function updateSubject(
  id: string,
  updates: Partial<ISubject>
): ISubject | null {
  const subjects = getSubjectStore();
  const index = subjects.findIndex((subject) => subject._id === id);
  if (index === -1) return null;
  subjects[index] = { ...subjects[index], ...updates };
  return subjects[index];
}

export function deleteSubject(id: string): boolean {
  const subjects = getSubjectStore();
  const index = subjects.findIndex((subject) => subject._id === id);
  if (index === -1) return false;
  subjects.splice(index, 1);
  return true;
}

export function getSubjetCount(): number {
  return getSubjectStore().length;
}
