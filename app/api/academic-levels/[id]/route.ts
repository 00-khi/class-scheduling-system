import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityHandlers } from "@/lib/api/entity-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { AcademicLevel } from "@prisma/client";
import { NextResponse } from "next/server";

const handlers = createEntityHandlers<AcademicLevel>({
  model: "academicLevel",
  allowedFields: [
    { key: "code", type: "string" },
    { key: "name", type: "string" },
    { key: "yearStart", type: "number" },
    { key: "numberOfYears", type: "number" },
  ],
  validateUpdate: async (data) => {
    if (
      (data.yearStart && data.numberOfYears === undefined) ||
      (data.yearStart === undefined && data.numberOfYears)
    ) {
      return NextResponse.json(
        {
          error:
            "Both yearStart and numberOfYears must be defined. You cannot define only one.",
        },
        { status: 400 }
      );
    }

    if (
      (data.yearStart !== undefined && data.yearStart <= 0) ||
      (data.numberOfYears !== undefined && data.numberOfYears <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Starting year and number of years must not be zero or negative.",
        },
        { status: 400 }
      );
    }
    console.log(data.yearStart !== undefined);
  },
  transform: (data) => {
    const transformed = { ...data };

    if (data.code) transformed.code = toUppercase(data.code);

    if (data.name) transformed.name = capitalizeEachWord(data.name);

    if (data.numberOfYears && data.yearStart) {
      const yearStart = Math.floor(data.yearStart);
      const numberOfYears = Math.floor(data.numberOfYears);
      transformed.yearList = Array.from(
        { length: numberOfYears },
        (_, i) => yearStart + i
      );
    } else {
      transformed.yearStart = 0;
      transformed.numberOfYears = 0;
      transformed.yearList = [];
    }

    return transformed;
  },
});

export const GET = createApiHandler(handlers.GET);
export const PUT = createApiHandler(handlers.PUT);
export const DELETE = createApiHandler(handlers.DELETE);
