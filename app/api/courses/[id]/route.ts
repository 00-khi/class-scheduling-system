import { createApiHandler } from "@/lib/api/api-handler";
import {
  validateIdParam,
  validatePartialRequestBody,
} from "@/lib/api/api-validator";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { Course } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  const course = await prisma.course.findUnique({
    where: { id },
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
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } = await validatePartialRequestBody<Course>(request, [
    { key: "code", type: "string" },
    { key: "name", type: "string" },
    { key: "academicLevelId", type: "number" },
  ]);

  if (error) return error;

  const updatedData: any = {};

  if (data.code) {
    updatedData.code = toUppercase(data.code);
  }

  if (data.name) {
    updatedData.name = capitalizeEachWord(data.name);
  }

  if (data.academicLevelId) {
    updatedData.academicLevelId = data.academicLevelId;
  }

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: updatedData,
  });

  return NextResponse.json(updatedCourse);
});

export const DELETE = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  await prisma.course.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Course deleted successfully." });
});
