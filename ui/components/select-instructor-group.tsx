"use client";

import { useEffect, useState } from "react";
import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  ACADEMIC_QUALIFICATIONS_API,
  INSTRUCTORS_API,
} from "@/lib/api/api-endpoints";
import { Instructor, AcademicQualification } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import {
  DataTableToolbar,
  DataTableToolbarGroup,
} from "./data-table-components";

type Option = { value: string | number; label: string };

export default function SelectInstructorGroup({
  onInstructorChange,
  disabled = false,
  reset = false,
  selectedInstructorId = null,
}: {
  onInstructorChange?: (instructor: number | null) => void;
  disabled?: boolean;
  reset?: boolean;
  selectedInstructorId?: number | null;
}) {
  const [selectedData, setSelectedData] = useState<{
    qualificationId?: number;
    instructorId?: number | null;
  } | null>(null);

  const instructorApi = createApiClient<Instructor>(INSTRUCTORS_API);
  const qualificationApi = createApiClient<AcademicQualification>(
    ACADEMIC_QUALIFICATIONS_API
  );

  const entityManagement = useManageEntities<Instructor>({
    apiService: { fetch: instructorApi.getAll },
    relatedApiServices: [
      { key: "qualifications", fetch: qualificationApi.getAll },
    ],
  });

  const qualifications = entityManagement.relatedData.qualifications || [];
  const instructors = entityManagement.data || [];

  const qualificationOptions: Option[] = qualifications
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((q) => ({
      label: q.name,
      value: q.id,
    }));

  const instructorOptions: Option[] =
    selectedData?.qualificationId !== undefined
      ? instructors
          .filter(
            (inst) =>
              inst.academicQualificationId === selectedData?.qualificationId
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((inst) => ({
            label: inst.name,
            value: inst.id,
          }))
      : instructors
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((inst) => ({
            label: inst.name,
            value: inst.id,
          }));

  // Reset
  useEffect(() => {
    if (reset) {
      setSelectedData(null);
      onInstructorChange?.(null);
    }
  }, [reset]);

  // Preselect instructor
  useEffect(() => {
    if (selectedInstructorId) {
      setSelectedData((prev) => ({
        ...prev,
        instructorId: selectedInstructorId,
      }));
    }
  }, [selectedInstructorId]);

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
          value={selectedData?.qualificationId?.toString() ?? ""}
          onValueChange={(value) => {
            handleInstructorChange(null);
            setSelectedData((prev) => ({
              ...prev,
              qualificationId: Number(value),
              instructorId: null,
            }));
          }}
          disabled={disabled || entityManagement.isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Qualification" />
          </SelectTrigger>
          <SelectContent>
            {qualificationOptions.length > 0 ? (
              qualificationOptions.map((opt) => (
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

        {/* Instructor */}
        <Select
          value={
            !entityManagement.isLoading
              ? selectedData?.instructorId?.toString() ?? ""
              : ""
          }
          onValueChange={(value) => handleInstructorChange(Number(value))}
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
      </DataTableToolbarGroup>
    </DataTableToolbar>
  );
}
