import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  const courses = await prisma.course.findMany({
    include: {
      academicLevel: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(courses);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const code = toUppercase(rawData.code);
  const name = capitalizeEachWord(rawData.name);
  const academicLevelId = parseInt(rawData.academicLevelId);

  if (!name || !academicLevelId || !code) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (isNaN(academicLevelId)) {
    return NextResponse.json(
      { error: "Invalid academic level ID." },
      { status: 400 }
    );
  }

  const data = { name, academicLevelId, code };

  const newCourse = await prisma.course.create({
    data,
  });

  return NextResponse.json(newCourse, { status: 201 });
});
