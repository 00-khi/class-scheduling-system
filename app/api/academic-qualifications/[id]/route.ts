// app/api/academic-qualifications/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import {
  validateIdParam,
  validatePartialRequestBody,
} from "@/lib/api/api-validator";
import { AcademicQualification } from "@prisma/client";

// GET /api/academic-qualifications/[id]
export const GET = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  const academicQualification = await prisma.academicQualification.findUnique({
    where: { id },
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
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } =
    await validatePartialRequestBody<AcademicQualification>(request, [
      { key: "code", type: "string" },
      { key: "name", type: "string" },
    ]);

  if (error) return error;

  const updatedData: any = {};

  if (data.code) {
    updatedData.code = toUppercase(data.code);
  }

  if (data.name) {
    updatedData.name = capitalizeEachWord(data.name);
  }

  const updatedAcademicQualification =
    await prisma.academicQualification.update({
      where: { id },
      data: updatedData,
    });

  return NextResponse.json(updatedAcademicQualification);
});

// DELETE /api/academic-qualifications/[id]
export const DELETE = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  await prisma.academicQualification.delete({
    where: { id },
  });

  return NextResponse.json({
    message: "Academic qualification deleted successfully",
  });
});
