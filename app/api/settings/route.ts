import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidDays, isValidTime } from "@/lib/schedule-utils";
import { Day, Semester } from "@prisma/client";
import { capitalizeEachWord } from "@/lib/utils";

// GET all settings
export async function GET() {
  const settings = await prisma.setting.findMany();
  return NextResponse.json(settings);
}

// UPDATE or CREATE setting
export async function POST(req: Request) {
  const { key, value } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "Key required" }, { status: 400 });
  }

  if (!value) {
    return NextResponse.json({ error: "Value required" }, { status: 400 });
  }

  const validSemesters = Object.values(Semester);

  if ((key === "dayStart" || key === "dayEnd") && !isValidTime(value)) {
    return NextResponse.json(
      { error: "Time must be in 30 minute steps like 07:00 or 07:30" },
      { status: 400 }
    );
  }

  if (key === "semester" && !validSemesters.includes(value)) {
    return NextResponse.json(
      {
        error: `Invalid semester value. It must be one of: ${validSemesters.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  if (key === "days" && !isValidDays(value)) {
    return NextResponse.json(
      {
        error: `Days must be a JSON array of valid Day values: ${Object.values(
          Day
        ).join(", ")}`,
      },
      { status: 400 }
    );
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json(setting);
}
