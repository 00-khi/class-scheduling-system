import { createApiHandler } from "@/lib/api/api-handler";
import {
  validateIdParam,
  validatePartialRequestBody,
} from "@/lib/api/api-validator";
import { createEntityHandlers } from "@/lib/api/entity-handler";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { Course } from "@prisma/client";
import { NextResponse } from "next/server";

const handlers = createEntityHandlers<Course>({
  model: "course",
  include: {
    academicLevel: true,
  },
  allowedFields: [
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
export const PUT = createApiHandler(handlers.PUT);
export const DELETE = createApiHandler(handlers.DELETE);
