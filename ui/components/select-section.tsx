"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shadcn/components/ui/select";
import { IAcademicLevel, ICourse, ISection } from "@/types";
import { getAcademicLevels } from "@/services/academicLevelService";
import { getCourses } from "@/services/courseService";
import { getSections } from "@/services/sectionService";
import { Loader2 } from "lucide-react";

interface SelectSectionProps {
  onSectionChange?: (section: string | null) => void;
  onAcademicLevelChange?: (academicLevel: string | null) => void;
}

export default function SelectSection({
  onSectionChange,
  onAcademicLevelChange,
}: SelectSectionProps) {
  const [sections, setSections] = useState<ISection[]>([]);
  const [academicLevels, setAcademicLevels] = useState<IAcademicLevel[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [academicLevel, setAcademicLevel] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [yearLevel, setYearLevel] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);

  // Load data
  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setSections(getSections());
      setAcademicLevels(getAcademicLevels());
      setCourses(getCourses());
      setLoading(false);
    }, 80);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getYearLevelsByCourseId = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return [];

    const yearLevels = course.yearLevels;
    return yearLevels;
  };

  const getFilteredCoursesByAcademicLevelId = (academicLevelId: string) => {
    if (!academicLevelId) return [];
    return courses.filter((c) => c.academicLevelId === academicLevelId);
  };

  const getFilteredSections = (
    academicLevelId: string,
    courseId: string,
    yearLevelId: string
  ) => {
    if (yearLevelId && courseId && academicLevelId)
      return sections.filter(
        (s) =>
          s.academicLevelId === academicLevelId &&
          s.courseId === courseId &&
          s.yearLevelId === yearLevelId
      );

    if (courseId && academicLevelId)
      return sections.filter(
        (s) => s.courseId === courseId && s.academicLevelId === academicLevelId
      );

    if (academicLevelId)
      return sections.filter((s) => s.academicLevelId === academicLevelId);

    return sections;
  };

  // // Notify parent when section changes
  useEffect(() => {
    if (onSectionChange) onSectionChange(section);
  }, [section, onSectionChange]);

  useEffect(() => {
    if (onAcademicLevelChange) onAcademicLevelChange(academicLevel);
  }, [academicLevel, onAcademicLevelChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading please wait...
        </span>
      </div>
    ); // Simple loader
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Academic Level */}
      <Select
        value={academicLevel ?? ""}
        onValueChange={(val) => {
          setAcademicLevel(val);
          setCourse(null);
          setYearLevel(null);
          setSection(null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Academic Level" />
        </SelectTrigger>
        <SelectContent>
          {academicLevels.map((level) => (
            <SelectItem key={level.id} value={level.id}>
              {level.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Course */}
      <Select
        value={course ?? ""}
        onValueChange={(val) => {
          setCourse(val);
          setYearLevel(null);
          setSection(null);
        }}
        disabled={!academicLevel}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Course" />
        </SelectTrigger>
        <SelectContent>
          {getFilteredCoursesByAcademicLevelId(academicLevel!).map((c) => (
            <SelectItem key={c.id} value={c.id as string}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Level */}
      <Select
        value={yearLevel ?? ""}
        onValueChange={(val) => {
          setYearLevel(val);
          setSection(null);
        }}
        disabled={!course}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Year Level" />
        </SelectTrigger>
        <SelectContent>
          {getYearLevelsByCourseId(course!).map((y) => (
            <SelectItem key={y.id ?? ""} value={y.id ?? ""}>
              {y.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Section */}
      <Select
        value={section ?? ""}
        onValueChange={(val) => setSection(val)}
        // disabled={!yearLevel}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Section" />
        </SelectTrigger>
        <SelectContent>
          {getFilteredSections(academicLevel!, course!, yearLevel!).map((s) => (
            <SelectItem key={s.id} value={s.id as string}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
