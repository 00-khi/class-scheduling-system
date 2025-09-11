import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord } from "@/lib/utils";
import { InstructorStatus } from "@prisma/client";
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

  const rawData = await request.json();

  const name = capitalizeEachWord(rawData.name);
  const academicQualificationId = parseInt(rawData.academicQualificationId);
  const status = rawData.status as InstructorStatus;

  const data = { name, academicQualificationId, status };

  const validStatuses = Object.values(InstructorStatus);

  console.log(data);

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

  const newInstructor = await prisma.instructor.create({
    data,
  });

  return NextResponse.json(newInstructor, { status: 201 });
});
