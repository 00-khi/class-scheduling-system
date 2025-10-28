import { createApiHandler } from "@/lib/api/api-handler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const DELETE = createApiHandler(async (request, context) => {
  const { id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid section ID." }, { status: 400 });
  }

  await prisma.scheduledSubject.deleteMany({
    where: { sectionId: numericId },
  });

  return NextResponse.json({ message: "Section schedule reset successfully." });
});
