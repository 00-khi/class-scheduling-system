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
import { Day, Room, RoomType, Semester, Subject } from "@prisma/client";
import { LoaderCircle, PlusIcon, Search, TrashIcon } from "lucide-react";
import { Card } from "@/ui/shadcn/card";
import { toast } from "sonner";
import {
  FormData,
  UnscheduledSubjectRow,
} from "../../unscheduled-subject-manager";
import { diffMinutes, normalizeTime, toHours } from "@/lib/schedule-utils";
import { Badge } from "@/ui/shadcn/badge";

type Option = { value: string | number; label: string };

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
  dayOptions: Option[];
  sectionId: number;
}) {
  const [isFindingSlot, setIsFindingSlot] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const selectedSubject = subjects.find((s) => s.id === formData?.subjectId);

  const filteredRooms =
    selectedSubject?.type === "Laboratory"
      ? rooms.filter((r) => r.type === "Laboratory")
      : rooms;

  const roomOptions = filteredRooms.map((r) => ({
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

  // total required in minutes (1 unit = 60 mins)
  const requiredMins = selectedSubject ? selectedSubject.units * 60 : 0;

  // sum all scheduled durations
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
  }, [formData?.subjectId, formData?.roomId, formData?.day]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      roomId: undefined,
    }));
  }, [formData?.subjectId]);

  async function handleFindSlot() {
    abortRef.current?.abort(); // cancel previous if running
    const controller = new AbortController();
    abortRef.current = controller;

    if (
      formData?.subjectId === undefined ||
      formData?.roomId === undefined ||
      formData.day === undefined
    ) {
      toast.error("Please select subject, room, & day");
      return;
    }

    setIsFindingSlot(true);

    const findSlot = {
      roomId: formData.roomId,
      sectionId,
      subjectId: formData.subjectId,
      unitsToSched: toHours(remainingMins),
      day: formData.day,
    };

    try {
      const response = await fetch("/api/lib/find-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(findSlot),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Response error");
      }

      setFormData((prev) => ({
        ...prev,
        startTime: normalizeTime(data.startTime),
        endTime: normalizeTime(data.endTime),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error(message);
      console.error("Error finding slot:", err);
    }

    setIsFindingSlot(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isSubmitting) return;
        if (!open) {
          setIsFindingSlot(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Schedule</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* SUBJECT SELECT */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData?.subjectId?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  subjectId: Number(value),
                }))
              }
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

          {/* ROOM SELECT */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="room">Room</Label>
            <Select
              value={formData?.roomId?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  roomId: Number(value),
                }))
              }
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

          {/* DAY SELECT */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="day">Day</Label>
            <Select
              value={formData?.day?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  day: value as Day,
                }))
              }
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

          {/* TIME INPUTS */}
          <div className="grid grid-cols-1">
            <div className="flex flex-row flex-nowrap gap-2 items-end">
              <div className="grid grid-cols-2 gap-2 w-full">
                {/* START TIME INPUT */}
                <div className="space-y-2">
                  <Label htmlFor="units">Start Time</Label>
                  <Input
                    type="time"
                    value={normalizeTime(formData?.startTime)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    placeholder="e.g., 7:30 AM"
                    disabled={isSubmitting}
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>

                {/* END TIME INPUT */}
                <div className="space-y-2">
                  <Label htmlFor="units">End Time</Label>
                  <Input
                    type="time"
                    value={normalizeTime(formData?.endTime)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    placeholder="e.g., 7:30 PM"
                    disabled={isSubmitting}
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                onClick={handleFindSlot}
                disabled={isFindingSlot}
              >
                {isFindingSlot ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Search />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-row flex-wrap gap-4 text-sm items-center">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Duration</span>
              <Badge variant="outline">{toHours(durationMins)}h</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Remaining</span>
              <Badge variant="secondary">{toHours(remainingMins)}h</Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                setIsFindingSlot(false);
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
  );
}
