import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { Semester } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  // get current semester from settings
  const semesterSetting = await prisma.setting.findUnique({
    where: { key: "semester" },
  });
  if (!semesterSetting) {
    return NextResponse.json(
      { error: "Semester setting not found" },
      { status: 400 }
    );
  }
  const currentSemester = semesterSetting.value as Semester;

  const unassignedSubjects = await prisma.scheduledSubject.findMany({
    where: {
      scheduledInstructor: { none: {} },
    },
    include: {
      room: true,
      subject: true,
      section: true,
    },
  });

  return NextResponse.json(unassignedSubjects);
});
