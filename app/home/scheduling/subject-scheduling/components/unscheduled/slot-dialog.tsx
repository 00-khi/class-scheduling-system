import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/shadcn/dialog";
import { Button } from "@/ui/shadcn/button";
import { Badge } from "@/ui/shadcn/badge";
import { formatTime } from "@/lib/schedule-utils";
import { Slot } from "./form-dialog";

export default function SlotDialog({
  isOpen,
  onClose,
  slots,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  slots: Slot[];
  onSelect: (slot: Slot) => void;
}) {
  function groupedSlots() {
    const map = new Map<number, Slot[]>();
    for (const s of slots) {
      const arr = map.get(s.duration) ?? [];
      arr.push(s);
      map.set(s.duration, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Slot</DialogTitle>
        </DialogHeader>

        {slots.length === 0 ? (
          <div className="py-4 text-center">No available slots</div>
        ) : (
          <div className="space-y-4">
            {groupedSlots().map(([duration, list]) => (
              <div key={duration} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge>{duration}h</Badge>
                  <Badge variant="secondary">{list.length} options</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.map((s, i) => (
                    <Badge
                      key={`${duration}-${i}-${s.startTime}`}
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => {
                        onSelect(s);
                        onClose();
                      }}
                    >
                      {formatTime(s.startTime)} - {formatTime(s.endTime)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
