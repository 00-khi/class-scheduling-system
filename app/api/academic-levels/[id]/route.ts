import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
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

  return NextResponse.json(academicLevel);
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

  if (rawData.startAt && rawData.years) {
    const startAt = parseInt(rawData.startAt);
    const years = parseInt(rawData.years);

    if (isNaN(startAt)) {
      return NextResponse.json(
        { error: "Invalid starting number." },
        { status: 400 }
      );
    }

    if (isNaN(years)) {
      return NextResponse.json(
        { error: "Invalid number of years." },
        { status: 400 }
      );
    }

    data.years = Array.from({ length: years }, (_, i) => startAt + i);
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
