import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Base interface for the Academic Qualification data
interface IAcademicQualificationBase {
  code: string;
  name: string;
}

// Interface for the data to create a new academic qualification
type ICreateAcademicQualification = IAcademicQualificationBase;

// GET /api/academic-qualifications
export async function GET() {
  try {
    const academicQualifications = await prisma.academicQualification.findMany({
      include: {
        _count: { select: { instructors: true } },
      },
    });
    return NextResponse.json(academicQualifications);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST /api/academic-qualifications
export async function POST(request: Request) {
  try {
    const body: ICreateAcademicQualification = await request.json();

    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const newAcademicQualification = await prisma.academicQualification.create({
      data: {
        code: body.code,
        name: body.name,
      },
    });

    return NextResponse.json(newAcademicQualification, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
