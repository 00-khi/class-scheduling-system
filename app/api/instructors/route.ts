import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/instructors
export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany();
    return NextResponse.json(instructors);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// Interface for the data to create a new instructor
interface ICreateInstructor {
  name: string;
  academicQualificationId: number;
  status: "PT" | "PTFL" | "PROBY" | "FT";
}

// POST /api/instructors
export async function POST(request: Request) {
  try {
    const body: ICreateInstructor = await request.json();

    // Basic validation to ensure required fields are present
    if (!body.name || !body.academicQualificationId || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const newInstructor = await prisma.instructor.create({
      data: {
        name: body.name,
        academicQualificationId: body.academicQualificationId,
        status: body.status,
      },
    });

    return NextResponse.json(newInstructor, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
