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
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { Day, Room, RoomType, Semester, Subject } from "@prisma/client";
import { LoaderCircle, PlusIcon, Search, TrashIcon } from "lucide-react";
import { Card } from "@/ui/shadcn/card";
import { toast } from "sonner";
import {
  FormData,
  UnassignedSubjectRow,
} from "../../unassigned-subject-manager";
import {
  diffMinutes,
  formatTime,
  normalizeTime,
  toHours,
} from "@/lib/schedule-utils";
import { Badge } from "@/ui/shadcn/badge";
import { Separator } from "@/ui/shadcn/separator";

type Option = { value: string | number; label: string };

export default function FormDialog({
  unassignedSubjects,
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  instructorOptions,
}: {
  unassignedSubjects: UnassignedSubjectRow[];
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  instructorOptions: Option[];
}) {
  const selectedUnassignedSubjects = unassignedSubjects.find(
    (s) => s.subjectId === formData?.scheduledSubjectId
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isSubmitting) return;
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Scheduled Subject</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Badge>{selectedUnassignedSubjects?.section?.name || "-"}</Badge>
          <Badge variant="outline">
            {selectedUnassignedSubjects?.subject?.name || "-"}
          </Badge>
          <Badge
            variant={
              selectedUnassignedSubjects?.subject?.type === "Laboratory"
                ? "default"
                : "secondary"
            }
          >
            {selectedUnassignedSubjects?.subject?.type || "-"}
          </Badge>
          <Badge variant="outline">
            {selectedUnassignedSubjects?.day || "-"}
          </Badge>
          <Badge variant="outline">
            {selectedUnassignedSubjects?.startTime
              ? formatTime(selectedUnassignedSubjects.startTime)
              : "-"}{" "}
            -{" "}
            {selectedUnassignedSubjects?.endTime
              ? formatTime(selectedUnassignedSubjects.endTime)
              : "-"}
          </Badge>
        </div>

        <Separator />

        <form onSubmit={onSubmit} className="space-y-4">
          {/* INSTRUCTOR SELECT */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="room">Instructor</Label>
            <Select
              value={formData?.isntructorId?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  isntructorId: Number(value),
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Instructor" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
