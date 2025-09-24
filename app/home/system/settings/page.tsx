"use client";

import {
  AVAILABLE_DAYS,
  DAY_END,
  DAY_START,
  normalizeTime,
} from "@/lib/schedule-utils";
import { getSettings, updateSetting } from "@/lib/settings-handler";
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
import { Day, Semester } from "@prisma/client";
import { LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SettingsSkeleton } from "./settings-skeleton";
import { replaceUnderscores } from "@/lib/utils";

type SettingsState = {
  semester?: Semester;
  dayStart?: string;
  dayEnd?: string;
  days?: Day[];
} | null;

export default function SettingsPage() {
  const [settingsState, setSettingsState] = useState<SettingsState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSchedule, setIsResetSchedule] = useState(false);

  const semesterOptions = Object.values(Semester).map((sem) => ({
    value: sem,
    label: sem,
  }));

  async function load() {
    setIsLoading(true);

    try {
      const settings = await getSettings();
      const map: SettingsState = {
        semester: (settings.find((s) => s.key === "semester")?.value ||
          "") as Semester,
        dayStart: settings.find((s) => s.key === "dayStart")?.value || "",
        dayEnd: settings.find((s) => s.key === "dayEnd")?.value || "",
        days: JSON.parse(settings.find((s) => s.key === "days")?.value || "[]"),
      };
      setSettingsState(map);
    } catch (e) {
      console.error("Failed to load settings", e);
    }

    setIsLoading(false);
  }

  // load settings on mount
  useEffect(() => {
    load();
  }, []);

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

  const handleSave = async () => {
    if (!settingsState) return;
    setIsSaving(true);

    try {
      await Promise.all([
        updateSetting("semester", settingsState.semester || "First_Semester"),
        updateSetting("dayStart", settingsState.dayStart || DAY_START),
        updateSetting("dayEnd", settingsState.dayEnd || DAY_END),
        updateSetting("days", JSON.stringify(settingsState.days || [])),
      ]);
      toast.success("Settings saved");
      load();
    } catch (e) {
      console.error("Failed to save settings", e);
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSchedule = () => {
    setIsResetSchedule(true);
  };

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Title>Settings</MainSection.Title>
        <MainSection.Content>
          {isLoading ? (
            <SettingsSkeleton />
          ) : (
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
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                          {semesterOptions.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                            >
                              {replaceUnderscores(opt.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={normalizeTime(settingsState?.dayStart)}
                          onChange={(e) =>
                            setSettingsState((prev) => ({
                              ...prev,
                              dayStart: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={normalizeTime(settingsState?.dayEnd)}
                          onChange={(e) =>
                            setSettingsState((prev) => ({
                              ...prev,
                              dayEnd: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* DAYS TOGGLE */}
                    <div className="space-y-2">
                      <Label>Days</Label>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {AVAILABLE_DAYS.map((day) => (
                          <div
                            key={day}
                            className="flex items-center space-x-2"
                          >
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
          )}
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
