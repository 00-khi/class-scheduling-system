"use client";

import { AVAILABLE_DAYS } from "@/lib/schedule-utils";
import { MainSection } from "@/ui/components/main-section";
import { Button } from "@/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { Separator } from "@/ui/shadcn/separator";
import { Toggle } from "@/ui/shadcn/toggle";
import { Day, Semester } from "@prisma/client";
import { LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useState } from "react";

type SettingsState = {
  semester?: Semester;
  dayStart?: string;
  dayEnd?: string;
  days?: Day[];
} | null;

export default function SettingsPage() {
  const [settingsState, setSettingsState] = useState<SettingsState>({
    semester: "First",
    dayStart: "07:30",
    dayEnd: "19:30",
    days: ["Monday"],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isResetSchedule, setIsResetSchedule] = useState(false);

  const semesterOptions = Object.values(Semester).map((sem) => ({
    value: sem,
    label: sem,
  }));

  const handleDayToggle = (day: Day, checked: boolean) => {
    if (checked) {
      setSettingsState((prev) => ({
        ...prev,
        days: [...(prev?.days ?? []), day],
      }));
    } else {
      setSettingsState((prev) => ({
        ...prev,
        days: (prev?.days ?? []).filter((d) => d !== day),
      }));
    }
  };

  const handleSave = () => {
    setIsSaving(true);
  };

  const handleResetSchedule = () => {
    setIsResetSchedule(true);
  };

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Settings</MainSection.Title>
        <MainSection.Content>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="gap-4">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Institution Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-y py-4 space-y-4 h-full">
                  {/* SEMESTER SELECT */}
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="subject">Default Semester</Label>
                    <Select
                      value={settingsState?.semester?.toString() ?? ""}
                      onValueChange={(value) =>
                        setSettingsState((prev) => ({
                          ...prev,
                          semester: value as Semester,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                        {semesterOptions.length > 0 ? (
                          semesterOptions.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                            >
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

                  {/* DELETE DATA BUTTON */}
                  <Button
                    variant="destructive"
                    onClick={handleResetSchedule}
                    disabled={isResetSchedule}
                  >
                    <RotateCcw
                      className={isResetSchedule ? "animate-spin" : ""}
                    />
                    Reset Schedule
                  </Button>
                </CardContent>
              </Card>
              <Card className="gap-4">
                <CardHeader>
                  <CardTitle className="text-card-foreground font-normal">
                    Scheduling Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-y py-4 space-y-4 h-full">
                  {/* TIME INPUTS */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {/* START TIME INPUT */}
                    <div className="space-y-2">
                      <Label htmlFor="units">Start Time</Label>
                      <Input
                        type="time"
                        value={settingsState?.dayStart}
                        onChange={(e) =>
                          setSettingsState((prev) => ({
                            ...prev,
                            dayStart: e.target.value,
                          }))
                        }
                        placeholder="e.g., 7:30 AM"
                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>

                    {/* END TIME INPUT */}
                    <div className="space-y-2">
                      <Label htmlFor="units">End Time</Label>
                      <Input
                        type="time"
                        value={settingsState?.dayEnd}
                        onChange={(e) =>
                          setSettingsState((prev) => ({
                            ...prev,
                            dayEnd: e.target.value,
                          }))
                        }
                        placeholder="e.g., 7:30 PM"
                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* DAYS TOGGLE */}
                  <div className="space-y-2">
                    <Label htmlFor="units">Days</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABLE_DAYS.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={
                              settingsState?.days?.includes(day) ?? false
                            }
                            onCheckedChange={(checked) =>
                              handleDayToggle(day, !!checked)
                            }
                          />
                          <Label htmlFor={day} className="text-sm">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-row sm:justify-between items-center gap-2">
              <div className="w-full hidden sm:block">
                <Separator />
              </div>
              <Button
                className="w-full sm:w-min"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isSaving ? "Saving" : "Save"} Settings
              </Button>
            </div>
          </div>
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
