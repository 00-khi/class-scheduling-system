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

export default function BulkRestoreDialog({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
  isRestoring,
  entityManagement,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: () => void;
  isRestoring: boolean;
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
            <AlertDialogTitle>Restore</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore {selectedCount} selected{" "}
              {selectedCount === 1 ? "row" : "rows"} from archives.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
          <Button onClick={onConfirm} disabled={isRestoring}>
            {isRestoring ? "Restoring..." : "Restore"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
