import { createApiHandler } from "@/lib/api/api-handler";
import { validateRequestBody } from "@/lib/api/api-validator";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { validateAcademicLevelYears } from "@/lib/validators";
import { AcademicLevel } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  const academicLevels = await prisma.academicLevel.findMany({
    include: {
      _count: {
        select: {
          courses: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const sortedAndUnique = academicLevels.map((level) => ({
    ...level,
    yearList: validateAcademicLevelYears(level.yearList, level.id),
  }));

  return NextResponse.json(sortedAndUnique);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { rawData, error } = await validateRequestBody<AcademicLevel>(request, [
    { key: "code", type: "string" },
    { key: "name", type: "string" },
    { key: "yearStart", type: "number" },
    { key: "numberOfYears", type: "number" },
  ]);

  if (error) return error;

  const code = toUppercase(rawData.code);
  const name = capitalizeEachWord(rawData.name);
  const yearStart = rawData.yearStart;
  const numberOfYears = rawData.numberOfYears;

  if (yearStart < 0 || numberOfYears < 0) {
    return NextResponse.json(
      { error: "Starting year and number of years must not be negative." },
      { status: 400 }
    );
  }

  const yearList = Array.from(
    { length: numberOfYears },
    (_, i) => yearStart + i
  );

  const data = {
    code,
    name,
    yearList,
    yearStart,
    numberOfYears,
  };

  const newAcademicLevel = await prisma.academicLevel.create({
    data,
  });

  return NextResponse.json(newAcademicLevel, { status: 201 });
});
