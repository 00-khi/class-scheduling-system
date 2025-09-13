import { Course } from "@prisma/client";

const API_BASE_URL = "/api/courses";

export async function getCourses(): Promise<Course[]> {
  const response = await fetch(API_BASE_URL);

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to fetch courses.";
    throw new Error(msg);
  }

  return data;
}

export async function getCourseById(id: number): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (response.status === 404) {
    throw new Error("Course not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ?? `Service Error: Failed to fetch course with ID ${id}.`;
    throw new Error(msg);
  }

  return data;
}

export async function addCourse(
  course: Course
): Promise<Course> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(course),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to add course.";
    throw new Error(msg);
  }

  return data;
}

export async function updateCourse(
  id: number,
  course: Course
): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(course),
  });

  if (response.status === 404) {
    throw new Error("Course not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? `Service Error: Failed to update course.`;
    throw new Error(msg);
  }

  return data;
}

export async function deleteCourse(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    throw new Error("Course not found.");
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error ?? "Service Error: Failed to delete course.";
    throw new Error(msg);
  }

  return true;
}
