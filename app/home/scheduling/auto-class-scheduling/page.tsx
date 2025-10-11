"use client";

import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { createApiClient } from "@/lib/api/api-client";
import {
  ROOMS_API,
  SCHEDULED_SUBJECTS_API,
  SECTIONS_API,
  SUBJECTS_API,
} from "@/lib/api/api-endpoints";
import { AVAILABLE_DAYS, formatTime } from "@/lib/schedule-utils";
import { MainSection } from "@/ui/components/main-section";
import SelectSectionGroup from "@/ui/components/select-section-group";
import { Alert, AlertDescription, AlertTitle } from "@/ui/shadcn/alert";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { Separator } from "@/ui/shadcn/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/shadcn/table";
import { Room, Section, Subject } from "@prisma/client";
import {
  AlertCircleIcon,
  ArrowRight,
  CheckCircle,
  Loader2Icon,
  SaveAll,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type GeneratedSchedule = {
  startTime: string;
  endTime: string;
  day: string;
  roomId: number;
  subjectId: number;
};

export default function AutoClassSchedulingPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [generatedSchedules, setGeneratedSchedules] = useState<
    GeneratedSchedule[] | null
  >(null);
  const [generatedScheduleReports, setGeneratedScheduleReports] = useState<
    { failed?: string; subjectId: number }[] | null
  >(null);
  const [selectedSectionData, setSelectedSectionData] =
    useState<Section | null>(null);
  const [unscheduledSubjects, setUnscheduledSubjects] = useState<Subject[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);

  const roomLevelApi = createApiClient<Room>(ROOMS_API);
  const sectionsApi = createApiClient<Section>(SECTIONS_API);
  const subjectsApi = createApiClient<Subject>(SUBJECTS_API);

  const entityManagement = useManageEntities<Room>({
    apiService: { fetch: roomLevelApi.getAll },
    relatedApiServices: [
      { key: "sections", fetch: sectionsApi.getAll },
      { key: "subjects", fetch: subjectsApi.getAll },
    ],
  });

  async function fetchUnscheduledSubjects(sectionId: number) {
    const unscheduledSubjectsApi = createApiClient<Subject>(
      `${SECTIONS_API}/${sectionId}/subjects`
    );

    try {
      const data = await unscheduledSubjectsApi.getAll();
      setUnscheduledSubjects(data);
    } catch (error) {
      console.error("Failed to fetch unscheduled subjects", error);
    }
  }

  const subjects = entityManagement.relatedData.subjects as Subject[];

  const lectureRooms = entityManagement.data.filter(
    (room) => room.type === "Lecture"
  );
  const laboratoryRooms = entityManagement.data.filter(
    (room) => room.type === "Laboratory"
  );

  async function handleGenerateSchedule() {
    if (!selectedSectionId) {
      toast.error("Please select a section first.");
      return;
    }

    if (unscheduledSubjects.length === 0) {
      toast.error("All subjects are already scheduled for this section.");
      return;
    }

    if (selectedDays.length === 0) {
      toast.error("Please select at least one day.");
      return;
    }

    if (selectedRoomIds.length === 0) {
      toast.error("Please select at least one room.");
      return;
    }

    const postData = {
      sectionId: selectedSectionId,
      days: selectedDays,
      roomIds: selectedRoomIds,
    };

    setIsGenerating(true);

    try {
      const response = await fetch("/api/lib/auto-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate schedule.");
      }

      setGeneratedSchedules(data.newSchedules);
      setGeneratedScheduleReports(data.report);
      toast.success("Schedule generated successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      toast.error(message);
      console.error("Error generating schedule:", error);
    }

    setIsGenerating(false);
  }

  async function handleApplySchedule() {
    setIsApplying(true);

    const postData = {
      schedules: generatedSchedules,
    };

    try {
      const response = await fetch(`${SCHEDULED_SUBJECTS_API}/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to apply schedule.");
      }

      console.log(data, "applied");

      handleSectionChange(null);
      if (selectedSectionId) fetchUnscheduledSubjects(selectedSectionId);
      toast.success("Schedule applied.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      toast.error(message);
      console.error("Error applying schedule:", error);
    }

    setIsApplying(false);
  }

  function handleDayToggle(day: string, checked: boolean) {
    if (checked) {
      setSelectedDays((prev) => [...prev, day]);
    } else {
      setSelectedDays((prev) => prev.filter((d) => d !== day));
    }
  }

  function handleRoomToggle(roomId: number, checked: boolean) {
    if (checked) {
      setSelectedRoomIds((prev) => [...prev, roomId]);
    } else {
      setSelectedRoomIds((prev) => prev.filter((id) => id !== roomId));
    }
  }

  async function handleSectionChange(sectionId: number | null) {
    setGeneratedSchedules(null);
    setGeneratedScheduleReports(null);
    setSelectedSectionData(null);
    setUnscheduledSubjects([]);
    setSelectedRoomIds([]);
    setSelectedDays([]);

    if (sectionId === null) {
      setSelectedSectionId(null);
      return;
    }

    setSelectedSectionId(sectionId);

    const sections = entityManagement.relatedData.sections as Section[];

    if (!sections) {
      setSelectedSectionData(null);
      return;
    }

    const section = sections.find((sec) => sec.id === sectionId);

    setSelectedSectionData(section || null);
    fetchUnscheduledSubjects(sectionId);
  }

  return (
    <MainSection>
      <MainSection.Section>
        <MainSection.Content>
          <MainSection.Title>Auto Class Scheduling</MainSection.Title>
          <MainSection.Description>
            Automatically generate schedules based on selected rules.
          </MainSection.Description>
        </MainSection.Content>
        <MainSection.Content>
          <div className="space-y-3">
            <SelectSectionGroup
              disabled={
                isGenerating || entityManagement.isLoading || isApplying
              }
              onSectionChange={(id) => {
                handleSectionChange(id);
              }}
              reset={selectedSectionId === null}
            />

            {selectedSectionData ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Scheduling Configuration */}
                  <Card className="gap-4">
                    <CardHeader>
                      <CardTitle className="text-card-foreground font-normal">
                        Scheduling Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="border-y py-4 space-y-4 h-full">
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
                                disabled={isGenerating}
                                checked={selectedDays.includes(day)}
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

                      <Separator />

                      {/* ROOMS TOGGLE */}
                      <div className="space-y-2">
                        <Label>Rooms</Label>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {/* Lecture Rooms */}
                          <div>
                            <Label className="mb-2">Lecture</Label>
                            {lectureRooms.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No rooms found.
                              </p>
                            ) : (
                              <div className="grid grid-cols-2 gap-1">
                                {lectureRooms.map((lec) => (
                                  <div
                                    key={lec.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`lecture-${lec.id}`}
                                      disabled={isGenerating}
                                      checked={selectedRoomIds.includes(lec.id)}
                                      onCheckedChange={(checked) =>
                                        handleRoomToggle(lec.id, !!checked)
                                      }
                                    />
                                    <Label
                                      htmlFor={`lecture-${lec.id}`}
                                      className="text-sm"
                                    >
                                      {lec.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Laboratory Rooms */}
                          <div>
                            <Label className="mb-2">Laboratory</Label>
                            {laboratoryRooms.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No rooms found.
                              </p>
                            ) : (
                              <div className="grid grid-cols-2 gap-1">
                                {laboratoryRooms.map((lab) => (
                                  <div
                                    key={lab.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`lab-${lab.id}`}
                                      disabled={isGenerating}
                                      checked={selectedRoomIds.includes(lab.id)}
                                      onCheckedChange={(checked) =>
                                        handleRoomToggle(lab.id, !!checked)
                                      }
                                    />
                                    <Label
                                      htmlFor={`lab-${lab.id}`}
                                      className="text-sm"
                                    >
                                      {lab.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schedule Generation */}
                  <Card className="gap-4">
                    <CardHeader>
                      <CardTitle className="text-card-foreground font-normal">
                        Schedule Generation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="border-y py-4 space-y-4 h-full">
                      <div className="text-muted-foreground space-y-2">
                        <div className="flex justify-between">
                          <span>Section:</span>
                          <span className="text-foreground">
                            {selectedSectionData.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Unscheduled Subjects:</span>
                          <span className="text-foreground">
                            {unscheduledSubjects.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Days:</span>
                          <span className="text-foreground">
                            {selectedDays.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rooms:</span>
                          <span className="text-foreground">
                            {selectedRoomIds.length}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        disabled={
                          isGenerating ||
                          unscheduledSubjects.length === 0 ||
                          isApplying
                        }
                        onClick={handleGenerateSchedule}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2Icon className="animate-spin" />
                            Generating Schedule...
                          </>
                        ) : (
                          <>
                            <Zap />
                            Generate Schedule
                          </>
                        )}
                      </Button>

                      {unscheduledSubjects.length === 0 && (
                        <Alert>
                          <CheckCircle />
                          <AlertDescription>
                            All subjects for this section are already scheduled.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {generatedSchedules && (
                  <div>
                    <Card className="gap-4">
                      <CardHeader>
                        <CardTitle className="text-card-foreground font-normal flex items-center justify-between gap-2">
                          Generated Schedule Result
                          <Button
                            disabled={isApplying}
                            onClick={handleApplySchedule}
                          >
                            {isApplying ? (
                              <>
                                <Loader2Icon className="animate-spin" />
                                Applying Schedule...
                              </>
                            ) : (
                              <>
                                <SaveAll />
                                Apply Schedule
                              </>
                            )}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="border-y py-4 space-y-4 h-full">
                        <Card className="p-0 shadow-none rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Type</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {generatedSchedules.length > 0 ? (
                                generatedSchedules.map((sched, index) => {
                                  const subject = subjects.find(
                                    (sub) => sub.id === sched.subjectId
                                  );
                                  const room = entityManagement.data.find(
                                    (r) => r.id === sched.roomId
                                  );

                                  return (
                                    <TableRow key={index}>
                                      <TableCell className="font-medium">
                                        {sched.day}
                                      </TableCell>
                                      <TableCell>
                                        {formatTime(sched.startTime)} -{" "}
                                        {formatTime(sched.endTime)}
                                      </TableCell>
                                      <TableCell>
                                        <div>
                                          <div className="font-medium">
                                            {subject?.code || "N/A"}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {subject?.name || "N/A"}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {room?.name || "N/A"}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            subject?.type === "Laboratory"
                                              ? "default"
                                              : "secondary"
                                          }
                                        >
                                          {subject?.type}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell
                                    className="text-muted-foreground text-center py-6"
                                    colSpan={5}
                                  >
                                    No generated schedules found.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </Card>

                        <div className="space-y-2">
                          {generatedScheduleReports?.some(
                            (report) => report.failed
                          ) &&
                            generatedScheduleReports.map((report, index) =>
                              report.failed ? (
                                <Alert key={index} variant="destructive">
                                  <AlertCircleIcon />
                                  <AlertDescription>
                                    Failed to schedule{" "}
                                    {
                                      subjects.find(
                                        (s) => s.id === report.subjectId
                                      )?.name
                                    }
                                    . {report.failed}
                                  </AlertDescription>
                                </Alert>
                              ) : null
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <div className="flex flex-col justify-center items-center gap-2 text-muted-foreground  px-4 text-center">
                  <ArrowRight size={32} />
                  <span className=" text-sm">
                    Select a section to start generating class schedules
                  </span>
                </div>
              </Card>
            )}
          </div>
        </MainSection.Content>
      </MainSection.Section>
    </MainSection>
  );
}
