import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityCollectionHandlers } from "@/lib/api/entity-collection-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { Instructor, InstructorStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const handlers = createEntityCollectionHandlers<Instructor>({
  model: "instructor",
  include: { academicQualification: true },
  orderBy: { updatedAt: "desc" },
  requiredFields: [
    { key: "name", type: "string" },
    { key: "academicQualificationId", type: "number" },
    { key: "status", type: "string" },
  ],
  validateCreate: async (data) => {
    const validStatuses = Object.values(InstructorStatus);

    if (
      data.status &&
      !validStatuses.includes(toUppercase(data.status) as InstructorStatus)
    ) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be: ${validStatuses.join(", ")}`,
        },
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
export const POST = createApiHandler(handlers.POST);
