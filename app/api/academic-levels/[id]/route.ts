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

  let yearsArray: number[] = [];
  const yearsData = academicLevel.yearList;

  try {
    const parsedData =
      typeof yearsData === "string" ? JSON.parse(yearsData) : yearsData;

    if (!Array.isArray(parsedData)) {
      console.error(
        `Error: 'yearList' field for academic level ${
          academicLevel.id
        } is not an array. Found type: ${typeof parsedData}.`
      );
    } else {
      const filtered = parsedData.filter((item) => typeof item === "number");
      if (filtered.length !== parsedData.length) {
        console.error(
          `Error: 'yearList' array for academic level ${academicLevel.id} contains non-numeric values.`
        );
      }
      yearsArray = filtered;
    }
  } catch (e) {
    console.error(
      `Failed to parse 'yearList' field for academic level ${academicLevel.id}`
    );
  }

  // Deduplicate + sort
  const uniqueYears = Array.from(new Set(yearsArray)).sort((a, b) => a - b);

  return NextResponse.json({
    ...academicLevel,
    yearList: uniqueYears,
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

  if (rawData.startAt && rawData.numberOfYears) {
    const startAt = parseInt(rawData.startAt);
    const numberOfYears = parseInt(rawData.numberOfYears);

    if (isNaN(startAt)) {
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

    data.startAt = startAt;
    data.numberOfYears = numberOfYears;

    data.yearList = Array.from(
      { length: numberOfYears },
      (_, i) => startAt + i
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
