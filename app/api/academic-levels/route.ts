import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { validateAcademicLevelYears } from "@/lib/validators";
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

  const rawData = await request.json();

  const code = toUppercase(rawData.code);
  const name = capitalizeEachWord(rawData.name);
  const yearStart = parseInt(rawData.yearStart);
  const numberOfYears = parseInt(rawData.numberOfYears);

  if (!code || !name || !yearStart || !numberOfYears) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (isNaN(yearStart)) {
    return NextResponse.json(
      { error: "Invalid starting number." },
      { status: 400 }
    );
  }

  if (isNaN(numberOfYears)) {
    return NextResponse.json(
      { error: "Invalid number of years." },
      { status: 400 }
    );
  }

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
