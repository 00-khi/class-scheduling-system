// app/api/academic-qualifications/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { IAcademicQualification } from "@/lib/types";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";

// GET /api/academic-qualifications/[id]
export const GET = createApiHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const { id } = await params;
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
    const { id } = await params;
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

    // Apply formatting to 'code' and 'name' if they exist in the request body
    // This ensures we only format the fields that are being updated.
    if (data.code) {
      data.code = toUppercase(data.code);
    }
    if (data.name) {
      data.name = capitalizeEachWord(data.name);
    }

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
    const { id } = await params;
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
