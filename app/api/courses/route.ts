import { createApiHandler } from "@/lib/api/api-handler";
import { validateRequestBody } from "@/lib/api/api-validator";
import { createEntityCollectionHandlers } from "@/lib/api/entity-collection-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { Course } from "@prisma/client";
import { NextResponse } from "next/server";

const handlers = createEntityCollectionHandlers<Course>({
  model: "course",
  include: {
    academicLevel: true,
  },
  orderBy: { updatedAt: "desc" },
  requiredFields: [
    { key: "code", type: "string" },
    { key: "name", type: "string" },
    { key: "academicLevelId", type: "number" },
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
