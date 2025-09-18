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
import { FormData } from "../academic-level-manager";

export default function FormDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
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
          <DialogTitle>
            {formData?.id ? "Edit" : "Add"} Academic Level
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Academic Level Code</Label>
            <Input
              id="code"
              value={formData?.code ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, code: e.target.value }))
              }
              placeholder="e.g., TER, SHS, JHS"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Academic Level Name</Label>
            <Input
              id="name"
              value={formData?.name ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Tertiary, Senior High School, Junior High School"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearStart">Year Start</Label>
              <Input
                id="yearStart"
                value={formData?.yearStart ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    yearStart: Number(e.target.value),
                  }))
                }
                placeholder="Enter year start..."
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfYears">Number of Years</Label>
              <Input
                id="numberOfYears"
                value={formData?.numberOfYears ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    numberOfYears: Number(e.target.value),
                  }))
                }
                placeholder="Enter number of years..."
                disabled={isSubmitting}
              />
            </div>
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
