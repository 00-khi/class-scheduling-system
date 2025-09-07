import { ICourse } from "@/types";
import { getCourseStore } from "@/lib/data-store/courseStore";

export function getCourses(): ICourse[] {
  return [...getCourseStore()];
}

export function getCourseById(id: string): ICourse | undefined {
  const courses = getCourseStore();
  return courses.find((course) => course.id === id);
}

export function addCourse(course: Omit<ICourse, "id">): ICourse {
  const newCourse = { ...course, id: Date.now().toString() };
  getCourseStore().push(newCourse);
  return newCourse;
}

export function updateCourse(
  id: string,
  updates: Partial<ICourse>
): ICourse | null {
  const courses = getCourseStore();
  const index = courses.findIndex((course) => course.id === id);
  if (index === -1) return null;
  courses[index] = { ...courses[index], ...updates };
  return courses[index];
}

export function deleteCourse(id: string): boolean {
  const courses = getCourseStore();
  const index = courses.findIndex((course) => course.id === id);
  if (index === -1) return false;
  courses.splice(index, 1);
  return true;
}
