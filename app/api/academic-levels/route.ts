import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  const academicLevels = await prisma.academicLevel.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const sortedAndUnique = academicLevels.map((level) => {
    const yearsData = level.yearList;
    let yearsArray = [];

    try {
      const parsedData =
        typeof yearsData === "string" ? JSON.parse(yearsData) : yearsData;

      if (!Array.isArray(parsedData)) {
        console.error(
          `Error: 'yearList' field for academic level ${
            level.id
          } is not an array. Found type: ${typeof parsedData}.`
        );
        return { ...level, yearList: [] };
      }

      const containsNonNumbers = parsedData.some(
        (item) => typeof item !== "number"
      );
      if (containsNonNumbers) {
        console.error(
          `Error: 'yearList' array for academic level ${level.id} contains non-numeric values.`
        );
        yearsArray = parsedData.filter((item) => typeof item === "number");
      } else {
        yearsArray = parsedData;
      }
    } catch (e) {
      console.error(
        `Failed to parse 'yearList' field for academic level ${level.id}`
      );
      return { ...level, yearList: [] };
    }

    // Remove duplicates by converting the array to a Set and back to an array. And sort
    const uniqueYears = Array.from(new Set(yearsArray)).sort((a, b) => a - b);

    return {
      ...level,
      yearList: uniqueYears,
    };
  });

  return NextResponse.json(sortedAndUnique);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const code = toUppercase(rawData.code);
  const name = capitalizeEachWord(rawData.name);
  const startAt = parseInt(rawData.startAt);
  const numberOfYears = parseInt(rawData.numberOfYears);

  if (!code || !name || !startAt || !numberOfYears) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

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

  const yearList = Array.from({ length: numberOfYears }, (_, i) => startAt + i);

  const data = {
    code,
    name,
    yearList,
    startAt,
    numberOfYears,
  };

  const newAcademicLevel = await prisma.academicLevel.create({
    data,
  });

  return NextResponse.json(newAcademicLevel, { status: 201 });
});
