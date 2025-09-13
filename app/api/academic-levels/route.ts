import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  const academicLevels = await prisma.academicLevel.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const sortedAndUnique = academicLevels.map((level) => {
    const yearsData = level.years;
    let yearsArray = [];

    try {
      const parsedData =
        typeof yearsData === "string" ? JSON.parse(yearsData) : yearsData;

      if (!Array.isArray(parsedData)) {
        console.error(
          `Error: 'years' field for academic level ${
            level.id
          } is not an array. Found type: ${typeof parsedData}.`
        );
        return { ...level, years: [] };
      }

      const containsNonNumbers = parsedData.some(
        (item) => typeof item !== "number"
      );
      if (containsNonNumbers) {
        console.error(
          `Error: 'years' array for academic level ${level.id} contains non-numeric values.`
        );
        yearsArray = parsedData.filter((item) => typeof item === "number");
      } else {
        yearsArray = parsedData;
      }
    } catch (e) {
      console.error(
        `Failed to parse 'years' field for academic level ${level.id}`
      );
      return { ...level, years: [] };
    }

    // Remove duplicates by converting the array to a Set and back to an array
    const uniqueYears = Array.from(new Set(yearsArray));

    // Sort the unique array
    uniqueYears.sort((a, b) => a - b);

    return {
      ...level,
      years: uniqueYears,
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
  const years = parseInt(rawData.years);

  if (!code || !name || !startAt || !years) {
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

  if (isNaN(years)) {
    return NextResponse.json(
      { error: "Invalid number of years." },
      { status: 400 }
    );
  }

  const yearArray = Array.from({ length: years }, (_, i) => startAt + i);

  const data = {
    code,
    name,
    years: yearArray,
  };

  const newAcademicLevel = await prisma.academicLevel.create({
    data,
  });

  return NextResponse.json(newAcademicLevel, { status: 201 });
});
