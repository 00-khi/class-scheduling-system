import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/instructors/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params object to safely access its properties.
    const { id } = await params;

    // Convert the string parameter to a number as expected by Prisma.
    const instructorId = Number(id);

    // Basic validation to ensure the ID is a valid number.
    if (isNaN(instructorId)) {
      return NextResponse.json(
        { error: "Invalid instructor ID." },
        { status: 400 }
      );
    }

    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      include: { academicQualification: true },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(instructor);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// Interface for the incoming data in the PUT request
interface IUpdateInstructor {
  name?: string;
  academicQualificationId?: number;
  status?: "PT" | "PTFL" | "PROBY" | "FT";
}

// PUT /api/instructors/:id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const instructorId = Number(id);

    if (isNaN(instructorId)) {
      return NextResponse.json(
        { error: "Invalid instructor ID." },
        { status: 400 }
      );
    }

    const body: IUpdateInstructor = await request.json();

    const updatedInstructor = await prisma.instructor.update({
      where: { id: instructorId },
      data: {
        name: body.name,
        academicQualificationId: body.academicQualificationId,
        status: body.status,
      },
    });

    return NextResponse.json(updatedInstructor);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// DELETE /api/instructors/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const instructorId = Number(id);

    if (isNaN(instructorId)) {
      return NextResponse.json(
        { error: "Invalid instructor ID." },
        { status: 400 }
      );
    }

    const deletedInstructor = await prisma.instructor.delete({
      where: { id: instructorId },
    });

    return NextResponse.json(deletedInstructor);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Instructor not found." },
        { status: 404 }
      );
    }
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
