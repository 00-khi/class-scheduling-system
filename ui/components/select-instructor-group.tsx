"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  ACADEMIC_QUALIFICATIONS_API,
  INSTRUCTORS_API,
} from "@/lib/api/api-endpoints";
import { AcademicQualification, Instructor } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DataTableToolbar,
  DataTableToolbarGroup,
} from "./data-table-components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";

type Option = { value: string | number; label: string };

export default function SelectInstructorGroup({
  onInstructorChange,
  disabled = false,
  reset = false,
}: {
  onInstructorChange?: (instructorId: number | null) => void;
  disabled?: boolean;
  reset?: boolean;
}) {
  const [selectedData, setSelectedData] = useState<{
    academicQualificationId?: number;
    instructorId?: number | null;
  } | null>(null);

  const instructorApi = createApiClient<Instructor>(INSTRUCTORS_API);
  const academicQualificationApi = createApiClient<AcademicQualification>(
    ACADEMIC_QUALIFICATIONS_API
  );

  const entityManagement = useManageEntities<Instructor>({
    apiService: { fetch: instructorApi.getAll },
    relatedApiServices: [
      { key: "academicQualifications", fetch: academicQualificationApi.getAll },
    ],
  });

  const academicQualifications: AcademicQualification[] =
    entityManagement.relatedData?.academicQualifications || [];

  const academicQualifcationOptions: Option[] = academicQualifications.map(
    (academicQualification) => ({
      value: academicQualification.id,
      label: academicQualification.name,
    })
  );
  const instructorOptions: Option[] = entityManagement.data
    .filter((i) => {
      if (!selectedData?.academicQualificationId) {
        return true;
      }

      let match = true;
      if (selectedData?.academicQualificationId) {
        match =
          match &&
          i.academicQualificationId === selectedData.academicQualificationId;
      }

      return match;
    })
    .map((instructor) => ({
      value: instructor.id,
      label: instructor.name,
    }));

  // Reset trigger
  useEffect(() => {
    if (reset) {
      setSelectedData(null);
      onInstructorChange?.(null);
    }
  }, [reset]);

  function handleInstructorChange(instructorId: number | null) {
    setSelectedData((prev) => ({ ...prev, instructorId }));

    if (onInstructorChange && instructorId !== undefined)
      onInstructorChange(instructorId);
  }

  return (
    <DataTableToolbar>
      <DataTableToolbarGroup>
        {/* Academic Qualification */}
        <Select
          value={selectedData?.academicQualificationId?.toString() ?? ""}
          onValueChange={(value) => {
            setSelectedData((prev) => ({
              ...prev,
              academicQualificationId: Number(value),
              instructorId: null,
            }));
          }}
          disabled={disabled || entityManagement.isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Academic Qualification" />
          </SelectTrigger>
          <SelectContent>
            {academicQualifcationOptions.length > 0 ? (
              academicQualifcationOptions.map((opt) => (
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

          {/* Section */}
          <Select
            value={selectedData?.instructorId?.toString() ?? ""}
            onValueChange={(value) => {
              handleInstructorChange(Number(value));
            }}
            disabled={disabled || entityManagement.isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Instructor" />
            </SelectTrigger>
            <SelectContent>
              {instructorOptions.length > 0 ? (
                instructorOptions.map((opt) => (
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
        </Select>
      </DataTableToolbarGroup>
    </DataTableToolbar>
  );
}
