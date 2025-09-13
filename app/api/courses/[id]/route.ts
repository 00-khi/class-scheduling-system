import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid course ID." }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: numericId },
    include: {
      academicLevel: true,
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  return NextResponse.json(course);
});

export const PUT = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid course ID." }, { status: 400 });
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

  if (rawData.academicLevelId) {
    data.academicLevelId = parseInt(rawData.academicLevelId);

    if (isNaN(data.academicLevelId)) {
      return NextResponse.json(
        { error: "Invalid academic level ID." },
        { status: 400 }
      );
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
  }

  const updatedCourse = await prisma.course.update({
    where: { id: numericId },
    data,
  });

  return NextResponse.json(updatedCourse);
});

export const DELETE = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid course ID." }, { status: 400 });
  }

  await prisma.course.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ message: "Course deleted successfully." });
});
