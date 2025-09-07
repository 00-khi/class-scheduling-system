import { IScheduledSubject } from "@/types";
import { getScheduledSubjectStore } from "@/lib/data-store/scheduledSubjectStore";

export function getScheduledSubjects(): IScheduledSubject[] {
  return [...getScheduledSubjectStore()];
}

export function getScheduledSubjectById(
  id: string
): IScheduledSubject | undefined {
  const scheduledSubjects = getScheduledSubjectStore();
  return scheduledSubjects.find(
    (scheduledSubject) => scheduledSubject.id === id
  );
}

export function addScheduledSubject(
  scheduledSubject: Omit<IScheduledSubject, "id">
): IScheduledSubject {
  const newScheduledSubject = {
    ...scheduledSubject,
    id: Date.now().toString(),
  };
  getScheduledSubjectStore().push(newScheduledSubject);
  return newScheduledSubject;
}

export function updateScheduledSubject(
  id: string,
  updates: Partial<IScheduledSubject>
): IScheduledSubject | null {
  const scheduledSubjects = getScheduledSubjectStore();
  const index = scheduledSubjects.findIndex(
    (scheduledSubject) => scheduledSubject.id === id
  );
  if (index === -1) return null;
  scheduledSubjects[index] = { ...scheduledSubjects[index], ...updates };
  return scheduledSubjects[index];
}

export function deleteScheduledSubject(id: string): boolean {
  const scheduledSubjects = getScheduledSubjectStore();
  const index = scheduledSubjects.findIndex(
    (scheduledSubject) => scheduledSubject.id === id
  );
  if (index === -1) return false;
  scheduledSubjects.splice(index, 1);
  return true;
}
