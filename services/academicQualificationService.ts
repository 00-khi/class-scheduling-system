import { TAcademicQualification } from "@/lib/types";

const API_BASE_URL = "/api/academic-qualifications";

export async function getAcademicQualifications(): Promise<
  TAcademicQualification[]
> {
  const response = await fetch(API_BASE_URL);

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ?? "Service Error: Failed to fetch academic qualifications.";
    throw new Error(msg);
  }

  return data;
}

export async function getAcademicQualificationById(
  id: number
): Promise<TAcademicQualification | undefined> {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (response.status === 404) {
    throw new Error("Academic qualification not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ??
      `Service Error: Failed to fetch academic qualification with ID ${id}.`;
    throw new Error(msg);
  }
  
  return data;
}

export async function addAcademicQualification(
  academicQualification: Omit<
    TAcademicQualification,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<TAcademicQualification> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(academicQualification),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ?? "Service Error: Failed to add academic qualification.";
    throw new Error(msg);
  }

  return data;
}

export async function updateAcademicQualification(
  id: number,
  updates: Partial<
    Omit<TAcademicQualification, "id" | "createdAt" | "updatedAt">
  >
): Promise<TAcademicQualification> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (response.status === 404) {
    throw new Error("Academic qualification not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ??
      `Service Error: Failed to update academic qualification with ID ${id}.`;
    throw new Error(msg);
  }

  return data;
}

export async function deleteAcademicQualification(
  id: number
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    throw new Error("Academic qualification not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ??
      `Service Error: Failed to delete academic qualification with ID ${id}.`;
    throw new Error(msg);
  }

  return true;
}
