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

export default function RestoreDialog({
  isOpen,
  onClose,
  itemName,
  onConfirm,
  isRestoring,
}: {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
  onConfirm: () => void;
  isRestoring: boolean;
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore
              {itemName && <span className="font-semibold"> {itemName}</span>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <Button onClick={onConfirm} disabled={isRestoring}>
            {isRestoring ? "Restoring..." : "Restore"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
