import { createApiHandler } from "@/lib/api/api-handler";
import {
  validateIdParam,
  validatePartialRequestBody,
} from "@/lib/api/api-validator";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { validateAcademicLevelYears } from "@/lib/validators";
import { AcademicLevel } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  const academicLevel = await prisma.academicLevel.findUnique({
    where: { id },
  });

  if (!academicLevel) {
    return NextResponse.json(
      { error: "Academic level not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...academicLevel,
    yearList: validateAcademicLevelYears(
      academicLevel.yearList,
      academicLevel.id
    ),
  });
});

export const PUT = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } = await validatePartialRequestBody<AcademicLevel>(
    request,
    [
      { key: "code", type: "string" },
      { key: "name", type: "string" },
      { key: "yearStart", type: "number" },
      { key: "numberOfYears", type: "number" },
    ]
  );

  if (error) return error;

  const updatedData: any = {};

  if (data.code) {
    updatedData.code = toUppercase(data.code);
  }

  if (data.name) {
    updatedData.name = capitalizeEachWord(data.name);
  }

  if (
    (data.yearStart && !data.numberOfYears) ||
    (!data.yearStart && data.numberOfYears)
  ) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
  }

  if (data.yearStart && data.numberOfYears) {
    if (data.yearStart < 0 || data.numberOfYears < 0) {
      return NextResponse.json(
        { error: "Starting year and number of years must not be negative." },
        { status: 400 }
      );
    }

    updatedData.yearStart = data.yearStart;
    updatedData.numberOfYears = data.numberOfYears;

    updatedData.yearList = Array.from(
      { length: data.numberOfYears },
      (_, i) => (data.yearStart as number) + i
    );
  }

  const updateAcademicLevel = await prisma.academicLevel.update({
    where: { id },
    data: updatedData,
  });

  return NextResponse.json(updateAcademicLevel);
});

export const DELETE = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  await prisma.academicLevel.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Academic level deleted successfully." });
});
