"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shadcn/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/components/ui/tabs";
import { Button } from "@/shadcn/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select";
import { IAcademicLevel, ICourse, IRoom, ISection } from "@/types";
import { getRooms } from "@/services/roomService";
import { getAcademicLevels } from "@/services/academicLevelService";
import { getCourses } from "@/services/courseService";
import { getSections } from "@/services/sectionService";
import SelectSection from "@/ui/components/select-section";
import { Document, Packer, Paragraph, ImageRun } from "docx";
import { saveAs } from "file-saver";
// import Timetable from "./test-responsive-timetable.test";
// import Timetable from "./test-2-timetable.test";
import Timetable from "./test-timetable";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";

export default function SchedulesClient() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SelectSection onSectionChange={setSelectedSection} />
          <SelectRoom onRoomChange={setSelectedRoom} />
          <Button onClick={() => exportDocx()}>
            <FileText />
            Export DOCX
          </Button>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

      <Card className="pt-0 overflow-hidden gap-0">
        <Timetable />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Detailed Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto py-4 border-y">
          {/* detailed schedule table or kung ano man */}
        </CardContent>
      </Card>
    </div>
  );
}

function SelectRoom({
  onRoomChange,
}: {
  onRoomChange?: (room: string | null) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setRooms(getRooms());
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (onRoomChange) onRoomChange(selectedRoom);
  }, [selectedRoom, onRoomChange]);

  return (
    <Select
      value={selectedRoom ?? ""}
      onValueChange={(val) => {
        setSelectedRoom(val);
      }}
      disabled={loading}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={loading ? "Loading Rooms..." : "Select Rooms"}
        />
      </SelectTrigger>
      <SelectContent>
        {rooms.map((room) => (
          <SelectItem key={room.id} value={room.id!}>
            {room.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// TESTING
async function exportDocx() {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "Hello World",
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, "schedule_ni_maem.docx");
}
