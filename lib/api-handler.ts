// lib/api-handler.ts

import { type NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// type HandlerFunction<T extends any[]> = (...args: T) => Promise<NextResponse>;

type NextRouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Prisma Error Code:", error.code);
    // console.error("Prisma Error Message:", error.message);

    switch (error.code) {
      case "P2002": // Unique constraint violation
        const uniqueField = (error.meta?.target as string[]).join(", ");
        return NextResponse.json(
          { error: `The provided value for '${uniqueField}' already exists.` },
          { status: 409 } // Conflict
        );

      case "P2025": // Record not found
        const notFoundMessage = error.meta?.cause || "Record not found.";
        return NextResponse.json(
          { error: notFoundMessage },
          { status: 404 } // Not Found
        );

      case "P2003": // Foreign key constraint failed
        const foreignKeyMessage = `Foreign key constraint. Operation failed.`;
        return NextResponse.json(
          { error: foreignKeyMessage },
          { status: 400 } // Bad Request
        );

      // Add other specific cases here as needed...

      default: // All other known Prisma errors
        return NextResponse.json(
          { error: "Database operation failed. Please try again." },
          { status: 500 } // Internal Server Error
        );
    }
  }

  // Fallback for any non-Prisma errors
  console.error("API Error:", error);
  return NextResponse.json(
    { error: "Internal server error." },
    { status: 500 }
  );
}

export function createApiHandler(handlerFunction: NextRouteHandler): NextRouteHandler {
  return async (request, context) => {
    try {
      const response = await handlerFunction(request, context);
      return response;
    } catch (error) {
      return handlePrismaError(error);
    }
  };
}
