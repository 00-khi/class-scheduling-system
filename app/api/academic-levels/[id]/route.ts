import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { validateAcademicLevelYears } from "@/lib/validators";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid academic level ID." },
      { status: 400 }
    );
  }

  const academicLevel = await prisma.academicLevel.findUnique({
    where: { id: numericId },
  });

  if (!academicLevel) {
    return NextResponse.json(
      { error: "Academic level not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...academicLevel,
    yearList: validateAcademicLevelYears(
      academicLevel.yearList,
      academicLevel.id
    ),
  });
});

export const PUT = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid academic qualification ID." },
      { status: 400 }
    );
  }

  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const data: any = {};

  if (rawData.code) {
    data.code = toUppercase(rawData.code);
  }

  if (rawData.name) {
    data.name = capitalizeEachWord(rawData.name);
  }

  if (rawData.yearStart && rawData.numberOfYears) {
    const yearStart = parseInt(rawData.yearStart);
    const numberOfYears = parseInt(rawData.numberOfYears);

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

    data.yearStart = yearStart;
    data.numberOfYears = numberOfYears;

    data.yearList = Array.from(
      { length: numberOfYears },
      (_, i) => yearStart + i
    );
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
  }

  const updateAcademicLevel = await prisma.academicLevel.update({
    where: { id: numericId },
    data,
  });

  return NextResponse.json(updateAcademicLevel);
});

export const DELETE = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid academic level ID." },
      { status: 400 }
    );
  }

  await prisma.academicLevel.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ message: "Academic level deleted successfully." });
});
