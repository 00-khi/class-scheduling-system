import { Button } from "@/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/shadcn/dialog";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import { FormEvent } from "react";
import { FormData } from "../subject-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { CategoryType, Semester } from "@prisma/client";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Card } from "@/ui/shadcn/card";
import { toast } from "sonner";
import { replaceUnderscores } from "@/lib/utils";

type Option = { value: string | number; label: string };

export default function FormDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  semesterOptions,
  typeOptions,
  courseOptions,
  yearOptions,
  academicLevelOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  semesterOptions: Option[];
  typeOptions: Option[];
  courseOptions: Option[];
  yearOptions: Option[];
  academicLevelOptions: Option[];
}) {
  const handleAdd = () => {
    if (!formData) return;

    if (!formData.courseId || !formData.year) {
      toast.error("Please fill out all fields before adding.");
      return;
    }

    const isDuplicate =
      formData.courseSubjects?.some(
        (item) =>
          item.courseId === formData.courseId && item.year === formData.year
      ) ?? false;

    if (isDuplicate) {
      toast.error("Duplicate entry is not allowed.");
      return;
    }

    setFormData({
      ...formData,
      courseId: undefined,
      year: undefined,
      courseSubjects: [
        ...(formData.courseSubjects ?? []),
        {
          courseId: formData.courseId,
          year: formData.year,
        },
      ],
    });
  };

  const handleEdit = (
    oldCourseId?: number,
    oldYear?: number,
    newCourseId?: number,
    newYear?: number
  ) => {
    if (!formData) return;

    // Check if the item exists
    const exists = formData.courseSubjects?.some(
      (item) => item.courseId === oldCourseId && item.year === oldYear
    );

    if (!exists) {
      toast.error("Item to edit not found.");
      return;
    }

    // Check for duplicate before editing
    const duplicate = formData.courseSubjects?.some(
      (item) =>
        item.courseId === newCourseId &&
        item.year === newYear &&
        !(item.courseId === oldCourseId && item.year === oldYear) // exclude the current item
    );

    if (duplicate) {
      toast.error("Duplicate entry is not allowed.");
      return;
    }

    // Update the item
    const updated =
      formData.courseSubjects?.map((item) =>
        item.courseId === oldCourseId && item.year === oldYear
          ? { courseId: newCourseId, year: newYear }
          : item
      ) ?? [];

    setFormData({
      ...formData,
      courseSubjects: updated,
    });
  };

  const handleDelete = (courseId?: number, year?: number) => {
    if (!formData) return;

    const exists = formData.courseSubjects?.some(
      (item) => item.courseId === courseId && item.year === year
    );

    if (!exists) {
      console.error("No matching course subject found");
      return;
    }

    setFormData({
      ...formData,
      courseSubjects:
        formData.courseSubjects?.filter(
          (item) => !(item.courseId === courseId && item.year === year)
        ) ?? [],
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isSubmitting) return;
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData?.id ? "Edit" : "Add"} Subject</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* SUBJECT CODE INPUT */}
          <div className="space-y-2">
            <Label htmlFor="code">Subject Code</Label>
            <Input
              id="code"
              value={formData?.code ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, code: e.target.value }))
              }
              placeholder="e.g., OOP"
              disabled={isSubmitting}
            />
          </div>

          {/* SUBJECT NAME INPUT */}
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              value={formData?.name ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Object-Oriented Programming"
              disabled={isSubmitting}
            />
          </div>

          {/* SEMESTER SELECT */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={formData?.semester?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  semester: value as Semester,
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
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
          </div>

          {/* TYPE SELECT */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData?.type?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as CategoryType,
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                {typeOptions.length > 0 ? (
                  typeOptions.map((opt) => (
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
          </div>

          {/* UNITS INPUT */}
          <div className="space-y-2">
            <Label htmlFor="units">Units</Label>
            <Input
              id="units"
              type="number"
              step={0.1}
              value={formData?.units ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  units: Number(e.target.value),
                }))
              }
              placeholder="e.g., 3"
              disabled={isSubmitting}
            />
          </div>

          {/* FIELD OF SPECIALIZATION INPUT */}
          <div className="space-y-2">
            <Label htmlFor="fieldOfSpecialization">
              Field of Specialization
            </Label>
            <Input
              id="fieldOfSpecialization"
              value={formData?.fieldOfSpecialization ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fieldOfSpecialization: e.target.value,
                }))
              }
              placeholder="e.g., English / Foreign Language"
              disabled={isSubmitting}
            />
          </div>

          {/* ACADEMIC LEVEL SELECT */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="academicLevelId">Academic Level</Label>
            <Select
              value={formData?.academicLevelId?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  academicLevelId: Number(value),
                  courseSubjects: undefined,
                  courseId: undefined,
                  year: undefined,
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Academic Level" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
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
          </div>

          {/* ARRAY FIELD - COURSE && YEAR */}
          <div className="flex flex-row gap-2 items-end mb-4">
            <div className="grid grid-cols-2 gap-2 w-full">
              {/* COURSE SELECT */}
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData?.courseId?.toString() ?? ""}
                  onValueChange={(value) => {
                    setFormData({ ...formData, courseId: Number(value) });
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
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
              </div>

              {/* YEAR SELECT */}
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={formData?.year?.toString() ?? ""}
                  onValueChange={(value) => {
                    setFormData({ ...formData, year: Number(value) });
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
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
              </div>
            </div>

            {/* ARRAY FIELD - COURSE && YEAR - ADD BUTTON */}
            <Button
              type="button"
              size="icon"
              onClick={handleAdd}
              disabled={isSubmitting}
            >
              <PlusIcon />
            </Button>
          </div>

          {/* ARRAY FIELD - COURSE && YEAR - DISPLAY DATA */}
          {formData?.courseSubjects?.map((item, idx) => (
            <div key={idx} className="flex flex-row gap-2 items-end">
              <div className="grid grid-cols-2 gap-2 w-full">
                {/* COURSE SELECT */}
                <div className="grid grid-cols-1">
                  <Select
                    value={item?.courseId?.toString() ?? ""}
                    onValueChange={(value) =>
                      handleEdit(
                        item.courseId,
                        item.year,
                        Number(value),
                        item.year
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
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
                </div>

                {/* YEAR SELECT */}
                <div className="grid grid-cols-1">
                  <Select
                    value={item?.year?.toString() ?? ""}
                    onValueChange={(value) =>
                      handleEdit(
                        item.courseId,
                        item.year,
                        item.courseId,
                        Number(value)
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
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
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(item.courseId, item.year)}
                disabled={isSubmitting}
              >
                <TrashIcon />
              </Button>
            </div>
          ))}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
