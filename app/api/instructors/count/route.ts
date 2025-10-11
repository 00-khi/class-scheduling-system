import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prisma.instructor.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error(`ERROR GETTING COUNT: ${error}`);
    return NextResponse.json(
      { error: "Failed to get academic levels count" },
      { status: 500 }
    );
  }
}
