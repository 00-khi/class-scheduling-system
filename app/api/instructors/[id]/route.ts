import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { InstructorStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid instructor ID." },
      { status: 400 }
    );
  }

  const instructor = await prisma.instructor.findUnique({
    where: { id: numericId },
    include: {
      academicQualification: true,
    },
  });

  if (!instructor) {
    return NextResponse.json(
      { error: "Instructor not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(instructor);
});

export const PUT = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid instructor ID." },
      { status: 400 }
    );
  }

  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawData = await request.json();

  const data: any = {};

  const validStatuses = Object.values(InstructorStatus);

  if (rawData.name) {
    data.name = capitalizeEachWord(rawData.name);
  }

  if (rawData.academicQualificationId) {
    data.academicQualificationId = parseInt(rawData.academicQualificationId);

    if (isNaN(data.academicQualificationId)) {
      return NextResponse.json(
        { error: "Invalid academic qualification ID." },
        { status: 400 }
      );
    }
  }

  if (rawData.status) {
    data.status = toUppercase(rawData.status) as InstructorStatus;

    if (!validStatuses.includes(data.status)) {
      return NextResponse.json(
        {
          error: `Invalid status value. It must be one of: ${validStatuses.join(
            ", "
          )}`,
        },
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

  const updatedInstructor = await prisma.instructor.update({
    where: { id: numericId },
    data,
  });

  return NextResponse.json(updatedInstructor);
});

export const DELETE = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid instructor ID." },
      { status: 400 }
    );
  }

  await prisma.instructor.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ message: "Instructor deleted successfully." });
});
