import { prisma } from "@/lib/prisma";
import { TAcademicQualification } from "@/lib/types";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";

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

  const rawData = await request.json();

  const code = toUppercase(rawData.code);
  const name = capitalizeEachWord(rawData.name);

  const data = { code, name };

  if (!code || !name) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const newAcademicQualification = await prisma.academicQualification.create({
    data,
  });

  return NextResponse.json(newAcademicQualification, { status: 201 });
});
