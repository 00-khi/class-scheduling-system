import { prisma } from "@/lib/prisma";
import { IAcademicQualification } from "@/lib/types";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";

export const GET = createApiHandler(async () => {
  const academicQualifications = await prisma.academicQualification.findMany();
  return NextResponse.json(academicQualifications);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body: Omit<IAcademicQualification, "id"> = await request.json();

  if (!body.code || !body.name) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const newAcademicQualification = await prisma.academicQualification.create({
    data: {
      code: body.code,
      name: body.name,
    },
  });

  return NextResponse.json(newAcademicQualification, { status: 201 });
});