import { IAcademicQualification } from "@/lib/types";

const API_BASE_URL = "/api/academic-qualifications";

export async function getAcademicQualification(): Promise<
  IAcademicQualification[]
> {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch academic qualifications.");
  }
  return await response.json();
}

export async function getAcademicQualificationById(
  id: string
): Promise<IAcademicQualification | undefined> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch academic qualification with ID ${id}.`);
  }
  return await response.json();
}

export async function addAcademicQualification(
  academicQualification: Omit<IAcademicQualification, "id">
): Promise<IAcademicQualification> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(academicQualification),
  });
  if (!response.ok) {
    throw new Error("Failed to add academic qualification.");
  }
  return await response.json();
}

export async function updateAcademicQualification(
  id: string,
  updates: Partial<IAcademicQualification>
): Promise<IAcademicQualification | null> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to update academic qualification with ID ${id}.`);
  }
  return await response.json();
}

export async function deleteAcademicQualification(
  id: string
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error(`Failed to delete academic qualification with ID ${id}.`);
  }
  return true;
}
