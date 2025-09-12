import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../shadcn/alert-dialog";

export function FailedDeletionDialog({
  open,
  onClose,
  failedCount,
  failedReasons,
}: {
  open: boolean;
  onClose: () => void;
  failedCount: number;
  failedReasons: string[];
}) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Failed to delete {failedCount} item(s)
          </AlertDialogTitle>
          <AlertDialogDescription>
            Some deletions could not be completed. Reasons:
          </AlertDialogDescription>
          <AlertDialogDescription className="text-destructive">
            <ul>
              {failedReasons.map((error, idx) => (
                <li key={idx}>{`- ${error}`}</li>
              ))}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
