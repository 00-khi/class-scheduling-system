import { NextResponse } from "next/server";

export async function validateRequestBody<T>(
  request: Request,
  requiredFields: (keyof T)[]
): Promise<{ data: T; error?: NextResponse }> {
  const body = await request.json();

  for (const field of requiredFields) {
    if (!body[field]) {
      return {
        data: body,
        error: NextResponse.json(
          { error: `Missing required field: ${String(field)}` },
          { status: 400 }
        ),
      };
    }
  }

  return { data: body, error: undefined };
}
