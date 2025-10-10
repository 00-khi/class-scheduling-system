import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const DELETE = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid scheduled subject ID." },
      { status: 400 }
    );
  }

  await prisma.scheduledInstructor.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ message: "Deleted successfully" });
});
