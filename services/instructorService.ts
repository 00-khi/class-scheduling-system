import { TInstructor } from "@/lib/types";

const API_BASE_URL = "/api/instructors";

export async function getInstructors(): Promise<TInstructor[]> {
  const response = await fetch(API_BASE_URL);

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to fetch instructors.";
    throw new Error(msg);
  }

  return data;
}

export async function getInstructorById(
  id: number
): Promise<TInstructor | undefined> {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (response.status === 404) {
    throw new Error("Instructor not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ?? `Service Error: Failed to fetch instructor with ID ${id}.`;
    throw new Error(msg);
  }

  return data;
}

export async function addInstructor(
  instructor: Omit<TInstructor, "id" | "createdAt" | "updatedAt">
): Promise<TInstructor> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(instructor),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to add instructor.";
    throw new Error(msg);
  }

  return data;
}

export async function updateInstructor(
  id: number,
  instructor: Partial<Omit<TInstructor, "id" | "createdAt" | "updatedAt">>
): Promise<TInstructor> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(instructor),
  });

  if (response.status === 404) {
    throw new Error("Instructor not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? `Service Error: Failed to update instructor.`;
    throw new Error(msg);
  }

  return data;
}

export async function deleteInstructor(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    throw new Error("Instructor not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to delete instructor.";
    throw new Error(msg);
  }

  return true;
}
