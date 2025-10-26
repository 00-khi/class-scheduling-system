import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  const archivedInstructors = await prisma.instructor.findMany({
    where: {
      isArchived: true,
    },
    include: {
      academicQualification: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(archivedInstructors);
});
