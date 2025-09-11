// app/api/academic-qualifications/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { TAcademicQualification } from "@/lib/types";
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

  const code = toUppercase(rawData.code);
  const name = capitalizeEachWord(rawData.name);

  const data = { code, name };
  console.log(data);

  if (!code || !name) {
    return NextResponse.json(
      { error: "Missing required fields." },
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

  return NextResponse.json({ message: "Academic qualification deleted successfully" });
});
