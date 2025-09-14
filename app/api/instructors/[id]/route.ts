import { createApiHandler } from "@/lib/api/api-handler";
import {
  validateIdParam,
  validatePartialRequestBody,
} from "@/lib/api/api-validator";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { Instructor, InstructorStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  const instructor = await prisma.instructor.findUnique({
    where: { id },
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
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } = await validatePartialRequestBody<Instructor>(
    request,
    [
      { key: "name", type: "string" },
      { key: "status", type: "string" },
      { key: "academicQualificationId", type: "number" },
    ]
  );

  if (error) return error;

  const updatedData: any = {};

  const validStatuses = Object.values(InstructorStatus);

  if (data.name) {
    updatedData.name = capitalizeEachWord(data.name);
  }

  if (data.academicQualificationId) {
    updatedData.academicQualificationId = data.academicQualificationId;
  }

  if (data.status) {
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

    updatedData.status = toUppercase(data.status) as InstructorStatus;
  }

  const updatedInstructor = await prisma.instructor.update({
    where: { id },
    data: updatedData,
  });

  return NextResponse.json(updatedInstructor);
});

export const DELETE = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  await prisma.instructor.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Instructor deleted successfully." });
});
