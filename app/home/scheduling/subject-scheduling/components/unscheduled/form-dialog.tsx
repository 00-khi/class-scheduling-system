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
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { Day, Room } from "@prisma/client";
import { LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";
import {
  FormData,
  UnscheduledSubjectRow,
} from "../../unscheduled-subject-manager";
import {
  diffMinutes,
  formatTime,
  normalizeTime,
  toHours,
} from "@/lib/schedule-utils";
import { Badge } from "@/ui/shadcn/badge";
import SlotDialog from "./slot-dialog";

export type Slot = { startTime: string; endTime: string; duration: number };

export default function FormDialog({
  subjects,
  rooms,
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  dayOptions,
  sectionId,
}: {
  subjects: UnscheduledSubjectRow[];
  rooms: Room[];
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  dayOptions: { value: string | number; label: string }[];
  sectionId: number;
}) {
  const [isFindingSlot, setIsFindingSlot] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const selectedSubject = subjects.find((s) => s.id === formData?.subjectId);

  const filteredRooms =
    selectedSubject?.type === "Laboratory"
      ? rooms.filter((r) => r.type === "Laboratory")
      : rooms;

  const roomOptions = filteredRooms
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => ({
      label: r.name,
      value: r.id,
      roomType: r.type,
    }));

  const subjectOptions = subjects.map((s) => ({
    label: s.name,
    value: s.id,
    subjectType: s.type,
  }));

  const durationMins = useMemo(
    () =>
      formData?.startTime && formData?.endTime
        ? Math.max(diffMinutes(formData.startTime, formData.endTime), 0)
        : 0,
    [formData?.startTime, formData?.endTime]
  );

  const requiredMins = selectedSubject ? selectedSubject.hours * 60 : 0;
  const scheduledMins =
    selectedSubject?.scheduledSubject?.reduce(
      (sum, sched) => sum + diffMinutes(sched.startTime, sched.endTime),
      0
    ) ?? 0;

  const remainingMins = Math.max(requiredMins - scheduledMins, 0);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      startTime: undefined,
      endTime: undefined,
    }));
    setSlots([]);
  }, [formData?.subjectId, formData?.roomId, formData?.day]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      roomId: undefined,
    }));
  }, [formData?.subjectId]);

  async function handleFindSlot() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!formData?.subjectId || !formData?.roomId || !formData?.day) {
      toast.error("Please select subject, room, & day");
      return;
    }

    setIsFindingSlot(true);
    setSlots([]);

    const findSlot = {
      roomId: formData.roomId,
      sectionId,
      subjectId: formData.subjectId,
      hoursToSched: toHours(remainingMins),
      day: formData.day,
    };

    try {
      const response = await fetch("/api/lib/find-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(findSlot),
        signal: controller.signal,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Response error");

      if (!Array.isArray(data.slots) || data.slots.length === 0) {
        toast.error("No available slots");
        return;
      }

      setSlots(data.slots);
      setSlotDialogOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error(message);
      console.error(err);
    } finally {
      setIsFindingSlot(false);
    }
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (isSubmitting) return;
          if (!open) {
            setIsFindingSlot(false);
            setSlots([]);
            onClose();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Subject Select */}
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData?.subjectId?.toString() ?? ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subjectId: Number(value) }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                  {subjectOptions.length > 0 ? (
                    subjectOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label} - {opt.subjectType}
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

            {/* Room Select */}
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="room">Room</Label>
              <Select
                value={formData?.roomId?.toString() ?? ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, roomId: Number(value) }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                  {roomOptions.length > 0 ? (
                    roomOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label} - {opt.roomType}
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

            {/* Day Select */}
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="day">Day</Label>
              <Select
                value={formData?.day?.toString() ?? ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, day: value as Day }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                  {dayOptions.length > 0 ? (
                    dayOptions.map((opt) => (
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

            {/* Manual Time Inputs & Find Slot */}
            <div className="grid grid-cols-1">
              <div className="flex flex-row gap-2 items-end">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={normalizeTime(formData?.startTime)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={normalizeTime(formData?.endTime)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  size="icon"
                  onClick={handleFindSlot}
                  disabled={isFindingSlot || isSubmitting}
                >
                  {isFindingSlot ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Search />
                  )}
                </Button>
              </div>
            </div>

            {/* Duration & Remaining */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex flex-row flex-wrap gap-4 text-sm items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Duration</span>
                  <Badge
                    variant={
                      durationMins > remainingMins ||
                      toHours(durationMins) % 0.5 !== 0
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {toHours(durationMins)}h
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Remaining</span>
                  <Badge variant="secondary">{toHours(remainingMins)}h</Badge>
                </div>
              </div>

              {(durationMins > remainingMins ||
                toHours(durationMins) % 0.5 !== 0) && (
                <span className="text-destructive text-sm">
                  {durationMins > remainingMins
                    ? "Duration exceeds remaining hours."
                    : "Duration must be a whole or half hour (e.g., 1, 1.5, 2)."}
                </span>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  setIsFindingSlot(false);
                  setSlots([]);
                }}
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

      {/* Slot Selection Dialog */}
      <SlotDialog
        isOpen={slotDialogOpen}
        slots={slots}
        onClose={() => setSlotDialogOpen(false)}
        onSelect={(slot) => {
          setFormData((prev) => ({
            ...prev,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }));
          toast.success(
            `Selected ${slot.duration}h ${slot.startTime} - ${slot.endTime}`
          );
        }}
      />
    </>
  );
}
