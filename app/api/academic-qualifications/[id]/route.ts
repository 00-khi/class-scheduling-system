import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Base interface for the Academic Qualification data
interface IAcademicQualificationBase {
  code: string;
  name: string;
}

// Interface for the incoming data in the PUT request for partial updates
interface IUpdateAcademicQualification {
  code?: string;
  name?: string;
}

// GET /api/academic-qualifications/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const academicQualificationId = Number(id);

    if (isNaN(academicQualificationId)) {
      return NextResponse.json(
        { error: "Invalid academic qualification ID." },
        { status: 400 }
      );
    }

    const academicQualification = await prisma.academicQualification.findUnique(
      {
        where: { id: academicQualificationId },
      }
    );

    if (!academicQualification) {
      return NextResponse.json(
        { error: "Academic qualification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(academicQualification);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// PUT /api/academic-qualifications/:id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const academicQualificationId = Number(id);

    if (isNaN(academicQualificationId)) {
      return NextResponse.json(
        { error: "Invalid academic qualification ID." },
        { status: 400 }
      );
    }

    const body: IUpdateAcademicQualification = await request.json();

    const updatedAcademicQualification =
      await prisma.academicQualification.update({
        where: { id: academicQualificationId },
        data: {
          code: body.code,
          name: body.name,
        },
      });

    return NextResponse.json(updatedAcademicQualification);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Academic qualification not found." },
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

// DELETE /api/academic-qualifications/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const academicQualificationId = Number(id);

    if (isNaN(academicQualificationId)) {
      return NextResponse.json(
        { error: "Invalid academic qualification ID." },
        { status: 400 }
      );
    }

    const deletedAcademicQualification =
      await prisma.academicQualification.delete({
        where: { id: academicQualificationId },
      });

    return NextResponse.json(deletedAcademicQualification);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Academic qualification not found." },
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
