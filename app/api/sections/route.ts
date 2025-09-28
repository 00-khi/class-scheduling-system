import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Semester } from "@prisma/client";
import { toLetters } from "@/lib/utils";

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

  const sections = await prisma.section.findMany({
    where: { semester: currentSemester },
    include: {
      course: {
        include: {
          academicLevel: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(sections);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const requiredFields = [
    { key: "courseId", type: "number" },
    { key: "year", type: "number" },
    { key: "totalSections", type: "number" },
  ];

  for (const { key, type } of requiredFields) {
    const value = rawData[key];

    if (value === undefined || value === null || value === "") {
      return NextResponse.json(
        { error: `Missing required field: ${key}` },
        { status: 400 }
      );
    }

    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== type) {
      return NextResponse.json(
        {
          error: `Invalid type for field ${key}. Expected ${type}, got ${actualType}.`,
        },
        { status: 400 }
      );
    }
  }

  const courseId = Number(rawData.courseId);
  const year = Number(rawData.year);
  const totalSections = Number(rawData.totalSections);

  if (isNaN(courseId)) {
    return NextResponse.json({ error: "Invalid course ID." }, { status: 400 });
  }

  if (isNaN(year)) {
    return NextResponse.json({ error: "Invalid year." }, { status: 400 });
  }

  if (isNaN(totalSections)) {
    return NextResponse.json(
      { error: "Invalid total sections." },
      { status: 400 }
    );
  }

  if (totalSections !== undefined && totalSections < 0) {
    return NextResponse.json(
      { error: "Total section must not be negative" },
      { status: 400 }
    );
  }

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

  const course = await prisma.course.findUniqueOrThrow({
    where: { id: courseId },
  });

  const existingSections = await prisma.section.findMany({
    where: {
      courseId: courseId,
      year: year,
      semester: currentSemester,
    },
    orderBy: { name: "asc" },
  });

  const existingNames = existingSections.map((s) => s.name);

  // target list of names
  const targetNames: string[] = [];
  for (let i = 0; i < (totalSections || 0); i++) {
    const suffix = toLetters(i); // A, B, C... AA...
    const name = `${course.code}${year}0${
      currentSemester === "First_Semester" ? 1 : 2
    }${suffix}`;
    targetNames.push(name);
  }

  const toInsert = targetNames.filter((n) => !existingNames.includes(n));
  const toDelete = existingNames.filter((n) => !targetNames.includes(n));

  // remove extra sections
  if (toDelete.length > 0) {
    await prisma.section.deleteMany({
      where: {
        courseId: courseId,
        year: year,
        semester: currentSemester,
        name: { in: toDelete },
      },
    });
  }

  const newSections = await prisma.section.createMany({
    data: toInsert.map((name) => ({
      name,
      year: year,
      semester: currentSemester,
      courseId: courseId,
    })),
  });

  return NextResponse.json(newSections);
});
