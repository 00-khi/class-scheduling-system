import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/shadcn/alert-dialog";
import { Button } from "@/ui/shadcn/button";
import { CircleAlertIcon } from "lucide-react";

export default function BulkArchiveDialog({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
  isArchiving,
  entityManagement,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: () => void;
  isArchiving: boolean;
  entityManagement: any;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive</AlertDialogTitle>
            <AlertDialogDescription>
              This will move {selectedCount} selected{" "}
              {selectedCount === 1 ? "row" : "rows"} to archives. You can
              restore them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
          <Button onClick={onConfirm} disabled={isArchiving}>
            {isArchiving ? "Archiving..." : "Archive"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
