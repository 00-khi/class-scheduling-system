import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { validateRequestBody } from "@/lib/api/api-validator";
import { AcademicQualification } from "@prisma/client";
import { createEntityCollectionHandlers } from "@/lib/api/entity-collection-handler";

const handlers = createEntityCollectionHandlers<AcademicQualification>({
  model: "academicQualification",
  include: {
    _count: {
      select: {
        instructors: true,
      },
    },
  },
  orderBy: { updatedAt: "desc" },
  requiredFields: [
    { key: "code", type: "string" },
    { key: "name", type: "string" },
  ],
  transform: (data) => {
    const transformed = { ...data };

    if (data.code) transformed.code = toUppercase(data.code);

    if (data.name) transformed.name = capitalizeEachWord(data.name);

    return transformed;
  },
});

export const GET = createApiHandler(handlers.GET);
export const POST = createApiHandler(handlers.POST);
