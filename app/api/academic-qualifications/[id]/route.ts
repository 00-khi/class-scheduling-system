// app/api/academic-qualifications/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";

// GET /api/academic-qualifications/[id]
export const GET = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid academic qualification ID." },
      { status: 400 }
    );
  }

  const academicQualification = await prisma.academicQualification.findUnique({
    where: { id: numericId },
  });

  if (!academicQualification) {
    return NextResponse.json(
      { error: "Academic qualification not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(academicQualification);
});

// PUT /api/academic-qualifications/[id]
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

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
  }

  const updatedAcademicQualification =
    await prisma.academicQualification.update({
      where: { id: numericId },
      data,
    });

  return NextResponse.json(updatedAcademicQualification);
});

// DELETE /api/academic-qualifications/[id]
export const DELETE = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid academic qualification ID." },
      { status: 400 }
    );
  }

  await prisma.academicQualification.delete({
    where: { id: numericId },
  });

  return NextResponse.json({
    message: "Academic qualification deleted successfully",
  });
});
