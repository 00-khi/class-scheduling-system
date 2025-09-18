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
import { FormData } from "../room-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { RoomType } from "@prisma/client";

type Option = { value: string | number; label: string };

export default function FormDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  typeOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  typeOptions: Option[];
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
          <DialogTitle>{formData?.id ? "Edit" : "Add"} Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={formData?.name ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., LAB A, 201"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 space-y-2">
            <Label htmlFor="type">Room Type</Label>
            <Select
              value={formData?.type ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as RoomType,
                }))
              }
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
