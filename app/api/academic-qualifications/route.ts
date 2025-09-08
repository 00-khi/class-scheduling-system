import { prisma } from "@/lib/prisma";
import { IAcademicQualification } from "@/lib/types";
import { NextResponse } from "next/server";

// GET /api/academic-qualifications
export async function GET() {
  try {
    const academicQualifications =
      await prisma.academicQualification.findMany();
    return NextResponse.json({ data: academicQualifications });
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
    const body: Omit<IAcademicQualification, "id"> = await request.json();

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
