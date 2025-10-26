import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityHandlers } from "@/lib/api/entity-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { Instructor, InstructorStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const handlers = createEntityHandlers<Instructor>({
  model: "instructor",
  include: { academicQualification: true },
  allowedFields: [
    { key: "name", type: "string" },
    { key: "status", type: "string" },
    { key: "academicQualificationId", type: "number" },
  ],
  validateUpdate: async (data) => {
    const validStatuses = Object.values(InstructorStatus);

    if (
      data.status &&
      !validStatuses.includes(toUppercase(data.status) as InstructorStatus)
    ) {
      return NextResponse.json(
        { error: `Invalid status. Must be: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
  },
  transform: (data) => {
    const transformed = { ...data };

    if (data.name) transformed.name = capitalizeEachWord(data.name);

    if (data.status)
      transformed.status = toUppercase(data.status) as InstructorStatus;

    return transformed;
  },
});

export const GET = createApiHandler(handlers.GET);
export const PUT = createApiHandler(handlers.PUT);
// export const DELETE = createApiHandler(handlers.DELETE);

export const DELETE = createApiHandler(async (request, context) => {
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
  });

  if (!instructor) {
    return NextResponse.json(
      { error: "Instructor not found." },
      { status: 404 }
    );
  }

  if (!instructor.isArchived) {
    await prisma.instructor.update({
      where: { id: numericId },
      data: { isArchived: true },
    });

    return NextResponse.json({ message: "Instructor archived." });
  }

  await prisma.instructor.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ message: "Instructor deleted permanently." });
});

// restore archived instructor
export const PATCH = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid instructor ID." },
      { status: 400 }
    );
  }

  // Check if the instructor exists in the database
  const instructor = await prisma.instructor.findUnique({
    where: { id: numericId },
  });

  if (!instructor) {
    return NextResponse.json(
      { error: "Instructor not found." },
      { status: 404 }
    );
  }

  // If the instructor is not archived, respond with a message
  if (!instructor.isArchived) {
    return NextResponse.json(
      { message: "Instructor is already active." },
      { status: 200 }
    );
  }

  // Restore the instructor by updating their isArchived status to false
  await prisma.instructor.update({
    where: { id: numericId },
    data: { isArchived: false },
  });

  return NextResponse.json({ message: "Instructor restored successfully." });
});
