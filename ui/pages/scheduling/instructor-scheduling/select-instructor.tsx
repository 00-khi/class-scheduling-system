import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shadcn/components/ui/select";
import { Loader2 } from "lucide-react";
import { IAcademicQualification, IInstructor } from "@/types";
import { getAcademicQualification } from "@/services/academicQualificationService";
import { getInstructors } from "@/services/instructorService";

interface SelectInstructorProps {
  onInstructorChange: (instructorId: string | null) => void;
}

export default function SelectInstructor({
  onInstructorChange,
}: SelectInstructorProps) {
  const [academicQualifications, setAcademicQualifications] = useState<IAcademicQualification[]>([]);
  const [instructors, setInstructors] = useState<IInstructor[]>([]);
  const [loading, setLoading] = useState(true);

  const [academicQualificationId, setAcademicQualificationId] = useState<string | null>(null);
  const [instructorId, setInstructorId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setTimeout(() => {
      setAcademicQualifications(getAcademicQualification());
      setInstructors(getInstructors());
      setLoading(false);
    }, 120);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    onInstructorChange(instructorId);
  }, [instructorId, onInstructorChange]);

  const filteredInstructors = () => {
    if (!academicQualificationId) return instructors;
    return instructors.filter((i) => i.academicQualificationId === academicQualificationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={academicQualificationId ?? ""}
        onValueChange={(val) => {
          setAcademicQualificationId(val || null);
          setInstructorId(null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Academic Qualification" />
        </SelectTrigger>
        <SelectContent>
          {academicQualifications.map((d) => (
            <SelectItem key={d._id} value={d._id!}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={instructorId ?? ""}
        onValueChange={(val) => setInstructorId(val || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Instructor" />
        </SelectTrigger>
        <SelectContent>
          {filteredInstructors().map((ins) => (
            <SelectItem key={ins._id} value={ins._id!}>
              {ins.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
