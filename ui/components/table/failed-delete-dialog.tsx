import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/shadcn/alert-dialog";

export default function FailedDeleteDialog({
  isOpen,
  onClose,
  failedCount,
  failedReasons,
}: {
  isOpen: boolean;
  onClose: () => void;
  failedCount: number;
  failedReasons: string[];
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Failed to delete {failedCount} item(s)
          </AlertDialogTitle>
          <AlertDialogDescription>
            Some deletions could not be completed. Reasons:
          </AlertDialogDescription>
          <AlertDialogDescription className="text-destructive">
            {failedReasons.map((error, idx) => (
              <div key={idx}>{`- ${error}`}</div>
            ))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onClose()}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
