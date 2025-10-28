"use client";

import { SidebarIcon } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import { Separator } from "@/ui/shadcn/separator";
import { useSidebar } from "@/ui/shadcn/sidebar";
import Image from "next/image";
import { ToggleTheme } from "../toggle-theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import { useEffect, useState } from "react";
import { Semester } from "@prisma/client";
import { toast } from "sonner";
import { getSettings, updateSetting } from "@/lib/settings-handler";
import { replaceUnderscores } from "@/lib/utils";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  const [currentSemester, setCurrentSemester] = useState<
    Semester | undefined | null
  >(null);
  const [isChangingSemester, setIsChangingSemester] = useState(false);

  async function load() {
    setIsChangingSemester(true);
    try {
      const settings = await getSettings();
      setCurrentSemester(
        (settings.find((s) => s.key === "semester")?.value || "") as Semester
      );
    } catch (e) {
      console.error("Failed to load current semester", e);
    }
    setIsChangingSemester(false);
  }

  useEffect(() => {
    load();
  }, []);

  // const semesterOptions = Object.values(Semester).map((sem) => ({
  //   value: sem,
  //   label: sem,
  // }));

  const semesterOptions = [
    {
      value: Semester.First_Semester,
      label: Semester.First_Semester,
    },
    {
      value: Semester.Second_Semester,
      label: Semester.Second_Semester,
    },
  ];

  const handleSemesterSelect = async (selectedSemester: Semester) => {
    setIsChangingSemester(true);

    try {
      await updateSetting("semester", selectedSemester);
      setCurrentSemester(selectedSemester);
      window.location.reload();
    } catch (e) {
      console.error("Failed to change semester", e);
      toast.error(e instanceof Error ? e.message : "Failed to change semester");
    }
  };

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4  overflow-y-auto">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>

        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* LOGO */}
        <div className="relative h-full w-15 hidden sm:block">
          <Image
            src="/images/sti_logo.png"
            alt="STI"
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-lg font-semibold hidden sm:block truncate">
          Automated Class Scheduling System
        </h1>
        <h1 className="text-lg font-semibold block sm:hidden pr-2">ACSS</h1>

        <div className="ml-auto flex items-center gap-2">
          <Select
            value={currentSemester?.toString() ?? ""}
            onValueChange={(value) => {
              handleSemesterSelect(value as Semester);
            }}
            disabled={isChangingSemester}
          >
            <SelectTrigger>
              <SelectValue placeholder="Current Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {replaceUnderscores(opt.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToggleTheme />
        </div>
      </div>
    </header>
  );
}
