import {
  durationMinutes,
  isValidHalfHour,
  minutesFromTime,
  overlaps,
  toHours,
} from "@/lib/scheduleUtils";
import {
  getAssignedSubjectById,
  getAssignedSubjects,
} from "@/services/assignedSubjectService";
import { getRooms } from "@/services/roomService";
import {
  addScheduledSubject,
  getScheduledSubjects,
} from "@/services/scheduledSubjectService";
import { getSections } from "@/services/sectionService";
import { getSubjectById, getSubjects } from "@/services/subjectService";
import { Badge } from "@/shadcn/components/ui/badge";
import { Button } from "@/shadcn/components/ui/button";
import { Progress } from "@/shadcn/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";
import {
  IAssignedSubject,
  IRoom,
  IScheduledSubject,
  ISection,
  ISubject,
} from "@/types";
import { DataForm } from "@/ui/components/data-form";
import { DataTable } from "@/ui/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, PlusIcon, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function UnscheduledSubjectsTable({
  selectedSection,
  onChange,
  refreshKey,
}: {
  selectedSection: string;
  onChange: () => void;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [assignedSubjects, setAssignedSubjects] = useState<IAssignedSubject[]>(
    []
  );
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [scheduledSubjects, setScheduledSubjects] = useState<
    IScheduledSubject[]
  >([]);

  // dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);

  const load = () => {
    setLoading(true);
    setTimeout(() => {
      const allAssignedSubjects = getAssignedSubjects();
      setAssignedSubjects(
        selectedSection
          ? allAssignedSubjects.filter((a) => a.sectionId === selectedSection)
          : allAssignedSubjects
      );
      setSubjects(getSubjects());
      setSections(getSections());
      setRooms(getRooms());
      setScheduledSubjects(getScheduledSubjects());
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    load();
  }, [selectedSection, refreshKey]);

  const totalScheduledInMinutes = useMemo(() => {
    const map = new Map<string, number>();

    scheduledSubjects
      .filter((s) => {
        const asg = getAssignedSubjectById(s.assignedSubjectId);
        return asg?.sectionId === selectedSection;
      })
      .forEach((s) => {
        const currentTotalMinutes = map.get(s.assignedSubjectId) || 0;
        map.set(
          s.assignedSubjectId,
          currentTotalMinutes + durationMinutes(s.startTime, s.endTime)
        );
      });
    return map; // minutes
  }, [scheduledSubjects, selectedSection]);

  const getSubject = (subjectId: string) => {
    const subject = subjects.find((c) => c.id === subjectId);

    return subject
      ? { ...subject }
      : {
          code: "Unknown",
          title: "Unknown",
          type: "Lecture",
          units: 0,
          academicLevelId: 0,
          courseId: 0,
          yearLevelId: 0,
          semester: 0,
        };
  };

  interface Row extends IAssignedSubject {
    subject: ISubject;
    scheduledMinutes: number;
    requiredMinutes: number;
  }

  const data: Row[] = useMemo(() => {
    return assignedSubjects
      .map((a) => {
        const subj = getSubjectById(a.subjectId);
        if (!subj) return null;

        const requiredMinutes = (subj.units || 0) * 60;
        const scheduledMinutes = totalScheduledInMinutes.get(a.id!) || 0;

        // filter out subjects already complete
        if (scheduledMinutes >= requiredMinutes) return null;

        return { ...a, subject: subj, scheduledMinutes, requiredMinutes };
      })
      .filter(Boolean) as Row[];
  }, [assignedSubjects, subjects, totalScheduledInMinutes]);

  const columns: ColumnDef<Row>[] = [
    {
      id: "progress",
      header: "Progress",
      accessorFn: (row) => row.scheduledMinutes,
      cell: ({ row }) => {
        const percent = Math.min(
          (row.original.scheduledMinutes / row.original.requiredMinutes) * 100,
          100
        );
        return (
          <div className="w-full flex flex-row gap-2 items-center">
            <Tooltip>
              <TooltipTrigger>
                <Progress value={percent} className="w-40" />
              </TooltipTrigger>
              <TooltipContent>
                {toHours(row.original.scheduledMinutes)} /{" "}
                {toHours(row.original.requiredMinutes)} hrs
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
    {
      id: "units",
      header: "Units",
      accessorFn: (row) => row.subject.units,
      cell: ({ getValue }) => {
        return <Badge variant="secondary">{getValue<number>()}</Badge>;
      },
    },
    {
      id: "subjectCode",
      header: "Subject Code",
      accessorFn: (row) => row.subject.code,
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>()}</Badge>
      ),
    },
    {
      id: "subjectTitle",
      header: "Subject Title",
      accessorFn: (row) => row.subject.title,
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorFn: (row) => row.subject.type,
      cell: ({ getValue }) => (
        <Badge
          variant={
            getValue<string>() === "Laboratory" ? "default" : "secondary"
          }
        >
          {getValue<string>()}
        </Badge>
      ),
    },
  ];

  const candidates = data.map((d) => {
    // ensure we pick required assigned-subject fields plus the extra fields
    return {
      id: d.id,
      subjectId: d.subjectId,
      sectionId: d.sectionId,
      // populated relation
      subject: d.subject,
      // totals (guarantee numbers)
      scheduledMins: d.scheduledMinutes ?? 0,
      requiredMins: d.requiredMinutes ?? 0,
    };
  }) as (IAssignedSubject & {
    subject: ISubject;
    scheduledMins: number;
    requiredMins: number;
  })[];

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading, please wait...
          </span>
        </div>
      ) : !selectedSection ? (
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            Select a section...
          </span>
        </div>
      ) : (
        <DataTable data={data} columns={columns}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DataTable.Search
              column="subjectTitle"
              placeholder="Search subjects..."
              className="max-w-full w-full"
            />
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAddOpen(true)}>
                <PlusIcon size={16} className="-ms-1 opacity-60" />
                Add Schedule
              </Button>
              <Button variant="outline" onClick={load}>
                <RefreshCcw className="-ms-1 opacity-60" size={16} />
                Refresh
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      {/* Add Schedule Dialog */}
      <ScheduleForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        sectionId={selectedSection}
        rooms={rooms}
        candidates={candidates}
        scheduledAll={scheduledSubjects}
        onAdded={() => {
          setIsAddOpen(false);
          onChange();
        }}
      />
    </div>
  );
}

function ScheduleForm({
  isOpen,
  onClose,
  sectionId,
  rooms,
  candidates,
  scheduledAll,
  onAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  rooms: IRoom[];
  candidates: (IAssignedSubject & {
    subject: ISubject;
    scheduledMins: number;
    requiredMins: number;
  })[];
  scheduledAll: IScheduledSubject[];
  onAdded: () => void;
}) {
  // dayOfWeek kept as string to match Select values.
  // interface Form {
  //   id?: string;
  //   assignedSubjectId: string;
  //   roomId: string;
  //   dayOfWeek: string; // "" or "0".."6"
  //   startTime: string;
  //   endTime: string;
  // }

  const [form, setForm] = useState<IScheduledSubject>({
    assignedSubjectId: "",
    roomId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const reset = () =>
    setForm({
      assignedSubjectId: "",
      roomId: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
    });

  const validate = (data: IScheduledSubject): string[] => {
    const errs: string[] = [];
    if (!data.assignedSubjectId) errs.push("Select subject");
    if (data.dayOfWeek === "") errs.push("Select day");
    if (!data.startTime || !data.endTime) errs.push("Set time range");

    const startM = minutesFromTime(data.startTime);
    const endM = minutesFromTime(data.endTime);
    if (endM <= startM) errs.push("End time must be later");
    if (!isValidHalfHour(data.startTime) || !isValidHalfHour(data.endTime))
      errs.push("Use 30-min steps");
    const dur = endM - startM;
    if (dur % 30 !== 0) errs.push("Duration must be in 30-min steps");

    // section overlap
    const dow = data.dayOfWeek;
    const sectionSchedules = scheduledAll.filter((s) => {
      const asg = getAssignedSubjectById(s.assignedSubjectId);
      return asg?.sectionId === sectionId && s.dayOfWeek === dow;
    });
    for (const s of sectionSchedules) {
      if (overlaps(data.startTime, data.endTime, s.startTime, s.endTime)) {
        errs.push("Time overlaps with another class");
        break;
      }
    }

    // duplicate timeslot for same subject
    const sameSubjectSameSlot = scheduledAll.some(
      (s) =>
        s.assignedSubjectId === data.assignedSubjectId &&
        s.dayOfWeek === dow &&
        s.startTime === data.startTime &&
        s.endTime === data.endTime
    );
    if (sameSubjectSameSlot) errs.push("Duplicate timeslot for subject");

    // units limit
    const picked = candidates.find((c) => c.id === data.assignedSubjectId);
    if (picked) {
      const newTotal = picked.scheduledMins + (endM - startM);
      if (newTotal > picked.requiredMins) errs.push("Exceeds allowed hours");
    } else {
      errs.push("Invalid subject");
    }

    return errs;
  };

  // handleSubmit must accept the data argument because DataForm calls onSubmit(formData)
  const handleSubmit = async (
    data: IScheduledSubject
  ): Promise<boolean | void> => {
    const errs = validate(data);
    if (errs.length > 0) {
      // show first error. keep toasts for now.
      toast.error(errs[0]);
      return false;
    }

    setSubmitting(true);
    try {
      const payload: IScheduledSubject = {
        assignedSubjectId: data.assignedSubjectId,
        roomId: data.roomId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      };

      const added = addScheduledSubject(payload);
      if (added?.id) {
        toast.success("Schedule added");
        reset();
        onAdded();
      } else {
        toast.error("Add failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // compute picked subject details for display
  const picked = useMemo(() => {
    return candidates.find((c) => c.id === form.assignedSubjectId);
  }, [form.assignedSubjectId]);

  const remainingMins = useMemo(
    () =>
      Math.max((picked?.requiredMins ?? 0) - (picked?.scheduledMins ?? 0), 0),
    [form]
  );

  // duration from selected start and end time
  const durationMins = useMemo(
    () =>
      form.startTime && form.endTime
        ? Math.max(durationMinutes(form.startTime, form.endTime), 0)
        : 0,
    [form.startTime, form.endTime]
  );

  // filter rooms by subject type
  const filteredRooms = useMemo(() => {
    if (!picked) return rooms;

    if (picked.subject.type === "Laboratory") {
      return rooms.filter((r) => r.type === "Laboratory");
    }

    return rooms;
  }, [form.assignedSubjectId]);

  return (
    <DataForm<IScheduledSubject>
      item={form}
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      onSubmit={handleSubmit}
      isLoading={submitting}
      title={{ add: "Add Schedule", edit: "Add Schedule" }}
    >
      <DataForm.Select
        name="assignedSubjectId"
        label="Assigned Subject"
        options={candidates
          .filter((c): c is typeof c & { id: string } => !!c.id)
          .map((c) => ({
            value: c.id,
            label: `${c.subject.code} - ${c.subject.title} (${toHours(
              c.requiredMins - c.scheduledMins
            )}h remaining)`,
          }))}
        required
        onValueChange={(v: string) => {
          setForm((p) => ({ ...p, assignedSubjectId: v }));
          console.log(v);
        }}
      />

      <DataForm.Select
        name="roomId"
        label="Room"
        options={filteredRooms.map((r) => ({
          value: r.id || "",
          label: r.name,
        }))}
        required
        onValueChange={(v: string) => setForm((p) => ({ ...p, roomId: v }))}
      />

      <DataForm.Select
        name="dayOfWeek"
        label="Day of Week"
        options={[
          { value: "0", label: "Sunday" },
          { value: "1", label: "Monday" },
          { value: "2", label: "Tuesday" },
          { value: "3", label: "Wednesday" },
          { value: "4", label: "Thursday" },
          { value: "5", label: "Friday" },
          { value: "6", label: "Saturday" },
        ]}
        required
        onValueChange={(v: string) => setForm((p) => ({ ...p, dayOfWeek: v }))}
      />

      <DataForm.Input
        type="time"
        name="startTime"
        label="Start Time"
        required
        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        onValueChange={(v: string) => setForm((p) => ({ ...p, startTime: v }))}
      />

      <DataForm.Input
        type="time"
        name="endTime"
        label="End Time"
        required
        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        onValueChange={(v: string) => setForm((p) => ({ ...p, endTime: v }))}
      />

      {/* info: remaining and duration */}
      <DataForm.Div>
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
      </DataForm.Div>
    </DataForm>
  );
}
