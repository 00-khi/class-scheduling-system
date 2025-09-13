import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { validateRequestBody } from "@/lib/api/api-validator";
import { AcademicQualification } from "@prisma/client";

export const GET = createApiHandler(async () => {
  const academicQualifications = await prisma.academicQualification.findMany({
    include: {
      _count: {
        select: {
          instructors: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(academicQualifications);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { rawData, error } = await validateRequestBody<AcademicQualification>(
    request,
    [
      { key: "code", type: "string" },
      { key: "name", type: "string" },
    ]
  );

  if (error) return error;

  const code = toUppercase(rawData.code);
  const name = capitalizeEachWord(rawData.name);

  const data = { code, name };

  const newAcademicQualification = await prisma.academicQualification.create({
    data,
  });

  return NextResponse.json(newAcademicQualification, { status: 201 });
});
