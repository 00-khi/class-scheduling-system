import { NextResponse } from "next/server";

type HandlerFunction = (request?: Request) => Promise<NextResponse>;

export function createApiHandler(handlerFunction: HandlerFunction) {
  return async (request?: Request) => {
    try {
      const response = await handlerFunction(request);
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