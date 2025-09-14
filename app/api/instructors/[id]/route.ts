import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityHandlers } from "@/lib/api/entity-handler";
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

    if (data.status && !validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
  },
  transform: (data) => {
    const transformed = data;

    if (data.name) transformed.name = capitalizeEachWord(data.name);
    if (data.status)
      transformed.status = toUppercase(data.status) as InstructorStatus;

    return transformed;
  },
});

export const GET = createApiHandler(handlers.GET);
export const PUT = createApiHandler(handlers.PUT);
export const DELETE = createApiHandler(handlers.DELETE);
