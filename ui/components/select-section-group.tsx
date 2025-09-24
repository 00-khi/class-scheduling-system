"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  ACADEMIC_LEVELS_API,
  COURSES_API,
  SECTIONS_API,
  SETTINGS_API,
} from "@/lib/api/api-endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import {
  AcademicLevel,
  Course,
  Section,
  Semester,
  Setting,
  Subject,
} from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DataTableToolbar,
  DataTableToolbarGroup,
} from "./data-table-components";
import { replaceUnderscores } from "@/lib/utils";

type Option = { value: string | number; label: string };

export default function SelectSectionGroup({
  onSectionChange,
}: {
  onSectionChange?: (section: number | null) => void;
}) {
  const [selectedData, setSelectedData] = useState<{
    academicLevelId?: number;
    courseId?: number;
    year?: number;
    sectionId?: number | null;
    semester?: Semester;
  } | null>(null);

  const sectionApi = createApiClient<Section>(SECTIONS_API);
  const academicLevelApi = createApiClient<AcademicLevel>(ACADEMIC_LEVELS_API);
  const courseApi = createApiClient<Course>(COURSES_API);
  const settingsApi = createApiClient<Setting>(SETTINGS_API);

  const entityManagement = useManageEntities<Section>({
    apiService: { fetch: sectionApi.getAll },
    relatedApiServices: [
      { key: "academicLevels", fetch: academicLevelApi.getAll },
      { key: "courses", fetch: courseApi.getAll },
      { key: "settings", fetch: settingsApi.getAll },
    ],
  });

  const academicLevels = entityManagement.relatedData.academicLevels || [];
  const courses = entityManagement.relatedData.courses || [];
  const settings = entityManagement.relatedData.settings || [];

  useEffect(() => {
    if (!settings.length) return;

    const defaultSemester = settings.find((s) => s.key === "semester")
      ?.value as Semester | undefined;

    if (defaultSemester) {
      setSelectedData((prev) => ({
        ...prev,
        semester: defaultSemester,
      }));
    }
  }, [settings]);

  const semesterOptions = Object.values(Semester).map((sem) => ({
    value: sem,
    label: sem,
  }));
  const academicLevelOptions: Option[] = academicLevels.map((al) => ({
    label: al.name,
    value: al.id,
  }));
  const courseOptions: Option[] =
    selectedData?.academicLevelId !== undefined
      ? courses
          .filter(
            (course) => course.academicLevelId === selectedData?.academicLevelId
          )
          .map((course) => ({
            label: course.name,
            value: course.id,
          }))
      : courses.map((course) => ({
          label: course.name,
          value: course.id,
        }));
  const yearOptions: Option[] =
    selectedData?.academicLevelId !== undefined
      ? (
          academicLevels.find(
            (level) => level.id === selectedData?.academicLevelId
          )?.yearList || []
        ).map((year: number) => ({
          label: year,
          value: year,
        }))
      : [];
  const sectionOptions: Option[] = entityManagement.data
    .filter((s: Section & { course?: { academicLevel: { id: number } } }) => {
      // no filters → return all
      if (
        !selectedData?.courseId &&
        !selectedData?.year &&
        !selectedData?.academicLevelId &&
        !selectedData?.semester
      ) {
        return true;
      }

      // apply filters if present
      let match = true;
      if (selectedData?.academicLevelId) {
        match =
          match && s.course?.academicLevel.id === selectedData.academicLevelId;
      }
      if (selectedData?.courseId) {
        match = match && s.courseId === selectedData.courseId;
      }
      if (selectedData?.year) {
        match = match && s.year === selectedData.year;
      }
      if (selectedData?.semester) {
        match = match && s.semester === selectedData.semester;
      }
      return match;
    })
    .map((section) => ({
      label: section.name,
      value: section.id,
    }));

  useEffect(() => {
    setSelectedData((prev) => ({
      ...prev,
      courseId: undefined,
      year: undefined,
      sectionId: null,
    }));
  }, [selectedData?.academicLevelId]);

  useEffect(() => {
    setSelectedData((prev) => ({
      ...prev,
      sectionId: null,
    }));
  }, [selectedData?.courseId, selectedData?.year]);

  useEffect(() => {
    if (onSectionChange && selectedData?.sectionId !== undefined)
      onSectionChange(selectedData.sectionId);
  }, [selectedData?.sectionId]);

  return (
    <DataTableToolbar>
      <DataTableToolbarGroup>
        {/* Academic Level */}
        <Select
          value={selectedData?.academicLevelId?.toString() ?? ""}
          onValueChange={(value) => {
            setSelectedData((prev) => ({
              ...prev,
              academicLevelId: Number(value),
            }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Academic Level" />
          </SelectTrigger>
          <SelectContent>
            {academicLevelOptions.length > 0 ? (
              academicLevelOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="-">
                No data found
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Course */}
        <Select
          value={selectedData?.courseId?.toString() ?? ""}
          onValueChange={(value) => {
            setSelectedData((prev) => ({ ...prev, courseId: Number(value) }));
          }}
          disabled={selectedData?.academicLevelId === undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Course" />
          </SelectTrigger>
          <SelectContent>
            {courseOptions.length > 0 ? (
              courseOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="-">
                No data found
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Year Level */}
        <Select
          value={selectedData?.year?.toString() ?? ""}
          onValueChange={(value) => {
            setSelectedData((prev) => ({ ...prev, year: Number(value) }));
          }}
          disabled={selectedData?.academicLevelId === undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Year Level" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.length > 0 ? (
              yearOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="-">
                No data found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </DataTableToolbarGroup>
      <DataTableToolbarGroup>
        {/* Section */}
        <Select
          value={selectedData?.sectionId?.toString() ?? ""}
          onValueChange={(value) => {
            setSelectedData((prev) => ({ ...prev, sectionId: Number(value) }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Section" />
          </SelectTrigger>
          <SelectContent>
            {sectionOptions.length > 0 ? (
              sectionOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="-">
                No data found
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Semester */}
        <Select
          value={selectedData?.semester?.toString() ?? ""}
          onValueChange={(value) => {
            setSelectedData((prev) => ({
              ...prev,
              semester: value as Semester,
            }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesterOptions.length > 0 ? (
              semesterOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {replaceUnderscores(opt.label)}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="-">
                No data found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </DataTableToolbarGroup>
    </DataTableToolbar>
  );
}
