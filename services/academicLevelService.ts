import { IAcademicLevel } from "@/types";
import { getAcademicLevelStore } from "@/lib/data-store/academicLevelStore";

export function getAcademicLevels(): IAcademicLevel[] {
  return [...getAcademicLevelStore()];
}

export function getAcademicLevelById(id: string): IAcademicLevel | undefined {
  const academicLevels = getAcademicLevelStore();
  return academicLevels.find((academicLevels) => academicLevels.id === id);
}

export function addAcademicLevel(
  academicLevels: Omit<IAcademicLevel, "id">
): IAcademicLevel {
  const newAcademicLevels = { ...academicLevels, id: Date.now().toString() };
  getAcademicLevelStore().push(newAcademicLevels);
  return newAcademicLevels;
}

export function updateAcademicLevel(
  id: string,
  updates: Partial<IAcademicLevel>
): IAcademicLevel | null {
  const academicLevels = getAcademicLevelStore();
  const index = academicLevels.findIndex((academicLevels) => academicLevels.id === id);
  if (index === -1) return null;
  academicLevels[index] = { ...academicLevels[index], ...updates };
  return academicLevels[index];
}

export function deleteAcademicLevel(id: string): boolean {
  const academicLevels = getAcademicLevelStore();
  const index = academicLevels.findIndex((academicLevels) => academicLevels.id === id);
  if (index === -1) return false;
  academicLevels.splice(index, 1);
  return true;
}

