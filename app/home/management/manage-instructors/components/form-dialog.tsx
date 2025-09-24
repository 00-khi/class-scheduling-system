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
import { FormData } from "../instructor-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { Instructor, InstructorStatus } from "@prisma/client";

type Option = { value: string | number; label: string };

export default function FormDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  statusOptions,
  academicQualificationOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  statusOptions: Option[];
  academicQualificationOptions: Option[];
}) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isSubmitting) return;
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formData?.id ? "Edit" : "Add"} Instructor</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Instructor Name</Label>
            <Input
              id="name"
              value={formData?.name ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Kyla Sinforoso"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 space-y-2">
            <Label htmlFor="academicLevelId">Status</Label>
            <Select
              value={formData?.status?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as InstructorStatus,
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                {statusOptions.length > 0 ? (
                  statusOptions.map((opt) => (
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

          <div className="grid grid-cols-1 space-y-2">
            <Label htmlFor="academicQualificationId">
              Academic Qualification
            </Label>
            <Select
              value={formData?.academicQualificationId?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  academicQualificationId: Number(value),
                }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Academic Qualification" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                {academicQualificationOptions.length > 0 ? (
                  academicQualificationOptions.map((opt) => (
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
