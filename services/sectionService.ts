import { ISection } from "@/types";
import { getSectionStore } from "@/lib/data-store/sectionStore";

export function getSections(): ISection[] {
  return [...getSectionStore()];
}

export function getSectionById(id: string): ISection | undefined {
  const sections = getSectionStore();
  return sections.find((section) => section._id === id);
}

export function addSection(section: Omit<ISection, "_id">): ISection {
  const newSection = { ...section, _id: Date.now().toString() };
  getSectionStore().push(newSection);
  return newSection;
}

export function updateSection(
  id: string,
  updates: Partial<ISection>
): ISection | null {
  const sections = getSectionStore();
  const index = sections.findIndex((section) => section._id === id);
  if (index === -1) return null;
  sections[index] = { ...sections[index], ...updates };
  return sections[index];
}

export function deleteSection(id: string): boolean {
  const sections = getSectionStore();
  const index = sections.findIndex((section) => section._id === id);
  if (index === -1) return false;
  sections.splice(index, 1);
  return true;
}

export function getSectionCount(): number {
  return getSectionStore().length;
}
