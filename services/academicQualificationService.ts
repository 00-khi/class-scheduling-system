import { IAcademicQualification } from "@/types";
import { getAcademicQualificationStore } from "@/lib/data-store/academicQualificationStore";

export function getAcademicQualification(): IAcademicQualification[] {
  return [...getAcademicQualificationStore()];
}

export function getAcademicQualificationById(
  id: string
): IAcademicQualification | undefined {
  const academicQualifications = getAcademicQualificationStore();
  return academicQualifications.find(
    (academicQualification) => academicQualification._id === id
  );
}

export function addAcademicQualification(
  academicQualification: Omit<IAcademicQualification, "_id">
): IAcademicQualification {
  const newAcademicQualification = {
    ...academicQualification,
    _id: Date.now().toString(),
  };
  getAcademicQualificationStore().push(newAcademicQualification);
  return newAcademicQualification;
}

export function updateAcademicQualification(
  id: string,
  updates: Partial<IAcademicQualification>
): IAcademicQualification | null {
  const academicQualifications = getAcademicQualificationStore();
  const index = academicQualifications.findIndex(
    (academicQualification) => academicQualification._id === id
  );
  if (index === -1) return null;
  academicQualifications[index] = {
    ...academicQualifications[index],
    ...updates,
  };
  return academicQualifications[index];
}

export function deleteAcademicQualification(id: string): boolean {
  const academicQualifications = getAcademicQualificationStore();
  const index = academicQualifications.findIndex(
    (academicQualification) => academicQualification._id === id
  );
  if (index === -1) return false;
  academicQualifications.splice(index, 1);
  return true;
}
