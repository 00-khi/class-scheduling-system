import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord } from "@/lib/utils";
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

  const name = capitalizeEachWord(rawData.name);
  const academicQualificationId = parseInt(rawData.academicQualificationId);
  const status = rawData.status as InstructorStatus;

  const validStatuses = Object.values(InstructorStatus);

  if (isNaN(academicQualificationId)) {
    return NextResponse.json(
      { error: "Invalid academic qualification ID." },
      { status: 400 }
    );
  }

  if (!name || !academicQualificationId || !status) {
    return NextResponse.json(
      { error: "Missing required fields." },
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
