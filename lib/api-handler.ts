// lib/api-handler.ts

import { NextResponse } from "next/server";

// This new HandlerFunction type can accept any number of arguments
type HandlerFunction = (...args: any[]) => Promise<NextResponse>;

export function createApiHandler(handlerFunction: HandlerFunction) {
  return async (...args: any[]) => {
    try {
      const response = await handlerFunction(...args);
      return response;
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  };
}