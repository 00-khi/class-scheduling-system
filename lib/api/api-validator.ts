import { NextResponse } from "next/server";

export type FieldType = "string" | "number" | "boolean" | "array" | "object";

export async function validateRequestBody<T>(
  request: Request,
  requiredFields: { key: keyof T; type: FieldType }[]
): Promise<{ rawData: Partial<T>; error?: NextResponse }> {
  const rawData = await request.json();
  const validatedData: Partial<T> = {};

  for (const { key, type } of requiredFields) {
    const value = rawData[key];

    if (value === undefined || value === null || value === "") {
      return {
        rawData: validatedData,
        error: NextResponse.json(
          { error: `Missing required field: ${String(key)}` },
          { status: 400 }
        ),
      };
    }

    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== type) {
      return {
        rawData: validatedData,
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

    validatedData[key] = value;
  }

  return { rawData: validatedData, error: undefined };
}

export async function validatePartialRequestBody<T>(
  request: Request,
  allowedFields: { key: keyof T; type: FieldType }[]
): Promise<{ data: Partial<T>; error?: NextResponse }> {
  const rawData = await request.json();
  const data: Partial<T> = {};

  for (const { key, type } of allowedFields) {
    const value = rawData[key as string];

    if (value !== undefined && value !== null && value !== "") {
      const actualType = Array.isArray(value) ? "array" : typeof value;

      if (actualType !== type) {
        return {
          data,
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

      data[key] = value;
    }
  }

  if (Object.keys(data).length === 0) {
    const allowedKeys = allowedFields.map((f) => String(f.key));
    return {
      data,
      error: NextResponse.json(
        {
          error: `At least one valid field is required. Allowed fields: ${allowedKeys.join(
            ", "
          )}.`,
        },
        { status: 400 }
      ),
    };
  }

  return { data, error: undefined };
}

export async function validateIdParam(context: {
  params: Promise<Record<string, string>>;
}): Promise<{ id?: number; invalidId?: NextResponse }> {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return {
      invalidId: NextResponse.json({ error: "Invalid ID." }, { status: 400 }),
    };
  }

  return { id: numericId };
}
