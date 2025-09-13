import { NextResponse } from "next/server";

type FieldType = "string" | "number" | "boolean" | "array" | "object";

export async function validateRequestBody<T>(
  request: Request,
  requiredFields: { key: keyof T; type: FieldType }[]
): Promise<{ rawData: T; error?: NextResponse }> {
  const rawData = await request.json();

  for (const { key, type } of requiredFields) {
    const value = rawData[key];

    if (value === undefined || value === null || value === "") {
      return {
        rawData,
        error: NextResponse.json(
          { error: `Missing required field: ${String(key)}` },
          { status: 400 }
        ),
      };
    }

    const actualType = Array.isArray(value) ? "array" : typeof value;

    if (actualType !== type) {
      return {
        rawData,
        error: NextResponse.json(
          {
            error: `Invalid type for field ${String(
              key
            )}. Expected ${type}, got ${actualType}.`,
          },
          { status: 400 }
        ),
      };
    }
  }

  

  return { rawData, error: undefined };
}
