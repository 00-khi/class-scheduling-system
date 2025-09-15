import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import {
  validateIdParam,
  validatePartialRequestBody,
} from "@/lib/api/api-validator";
import { AcademicQualification } from "@prisma/client";
import { createEntityHandlers } from "@/lib/api/entity-handler";

const handlers = createEntityHandlers<AcademicQualification>({
  model: "academicQualification",
  allowedFields: [
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
export const PUT = createApiHandler(handlers.PUT);
export const DELETE = createApiHandler(handlers.DELETE);
