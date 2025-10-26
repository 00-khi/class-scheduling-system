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
import { ArchiveIcon, CircleAlertIcon } from "lucide-react";

export default function ArchiveDialog({
  isOpen,
  onClose,
  itemName,
  onConfirm,
  isArchiving,
}: {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
  onConfirm: () => void;
  isArchiving: boolean;
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <ArchiveIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive</AlertDialogTitle>
            <AlertDialogDescription>
              This will move it to archives. You can restore it later.
              {itemName && <span className="font-semibold"> {itemName}</span>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <Button onClick={onConfirm} disabled={isArchiving}>
            {isArchiving ? "Archiving..." : "Archive"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
