import { AcademicLevel } from "@prisma/client";

const API_BASE_URL = "/api/academic-levels";

export async function getAcademicLevels(): Promise<AcademicLevel[]> {
  const response = await fetch(API_BASE_URL);

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to fetch academic levels.";
    throw new Error(msg);
  }

  return data;
}

export async function getAcademicLevelsById(
  id: number
): Promise<AcademicLevel> {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (response.status === 404) {
    throw new Error("Academic level not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ??
      `Service Error: Failed to fetch academic level with ID ${id}.`;
    throw new Error(msg);
  }

  return data;
}

export async function addAcademicLevel(
  academicLevel: AcademicLevel
): Promise<AcademicLevel> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(academicLevel),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to add academic level.";
    throw new Error(msg);
  }

  return data;
}

export async function updateAcademicLevel(
  id: number,
  academicLevel: AcademicLevel
): Promise<AcademicLevel> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(academicLevel),
  });

  if (response.status === 404) {
    throw new Error("Academic level not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? `Service Error: Failed to update academic level.`;
    throw new Error(msg);
  }

  return data;
}

export async function deleteAcademicLevel(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    throw new Error("Academic level not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to delete academic level.";
    throw new Error(msg);
  }

  return true;
}
