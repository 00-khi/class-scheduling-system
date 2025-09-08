// app/api/academic-qualifications/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { IAcademicQualification } from "@/lib/types";

// GET /api/academic-qualifications/[id]
export const GET = createApiHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const { id } = params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid academic qualification ID." },
        { status: 400 }
      );
    }

    const academicQualification = await prisma.academicQualification.findUnique(
      {
        where: { id: numericId },
      }
    );

    if (!academicQualification) {
      return NextResponse.json(
        { error: "Academic qualification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(academicQualification);
  }
);

// PUT /api/academic-qualifications/[id]
export const PUT = createApiHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const { id } = params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid academic qualification ID." },
        { status: 400 }
      );
    }

    if (!request) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Use object destructuring to remove the 'id' property from the body
    const { id: _, ...data } = await request.json();

    const updatedAcademicQualification =
      await prisma.academicQualification.update({
        where: { id: numericId },
        data, // Pass the new 'data' object without the 'id'
      });

    return NextResponse.json(updatedAcademicQualification);
  }
);

// DELETE /api/academic-qualifications/[id]
export const DELETE = createApiHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const { id } = params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid academic qualification ID." },
        { status: 400 }
      );
    }

    await prisma.academicQualification.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  }
);
