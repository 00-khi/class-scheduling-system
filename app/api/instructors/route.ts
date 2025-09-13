import { createApiHandler } from "@/lib/api/api-handler";
import { validateRequestBody } from "@/lib/api/api-validator";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { Instructor, InstructorStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  const instructors = await prisma.instructor.findMany({
    include: {
      academicQualification: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(instructors);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { rawData, error } = await validateRequestBody<Instructor>(request, [
    { key: "name", type: "string" },
    { key: "academicQualificationId", type: "number" },
    { key: "status", type: "string" },
  ]);

  if (error) return error;

  const name = capitalizeEachWord(rawData.name);
  const academicQualificationId = rawData.academicQualificationId;
  const status = toUppercase(rawData.status) as InstructorStatus;

  const validStatuses = Object.values(InstructorStatus);

  if (isNaN(academicQualificationId)) {
    return NextResponse.json(
      { error: "Invalid academic qualification ID." },
      { status: 400 }
    );
  }

  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      {
        error: `Invalid status value. It must be one of: ${validStatuses.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  const data = { name, academicQualificationId, status };

  const newInstructor = await prisma.instructor.create({
    data,
  });

  return NextResponse.json(newInstructor, { status: 201 });
});
