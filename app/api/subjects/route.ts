import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityCollectionHandlers } from "@/lib/api/entity-collection-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { CategoryType, Semester, Subject } from "@prisma/client";
import { NextResponse } from "next/server";

const handlers = createEntityCollectionHandlers<
  Subject & { courseSubjects: [{ courseId: number; year: number }] }
>({
  model: "subject",
  include: {
    academicLevel: true,
    courseSubjects: {
      include: { course: true },
    },
  },
  orderBy: { updatedAt: "desc" },
  requiredFields: [
    { key: "code", type: "string" },
    { key: "name", type: "string" },
    { key: "semester", type: "string" },
    { key: "units", type: "number" },
    { key: "type", type: "string" },
    { key: "academicLevelId", type: "number" },
    { key: "courseSubjects", type: "array" },
  ],
  validateCreate: async (data) => {
    const validTypes = Object.values(CategoryType);
    const validSemesters = Object.values(Semester);

    if (data.units !== undefined && data.units < 0) {
      return NextResponse.json(
        {
          error: `Units must not be negative`,
        },
        { status: 400 }
      );
    }

    if (
      data.type &&
      !validTypes.includes(capitalizeEachWord(data.type) as CategoryType)
    ) {
      return NextResponse.json(
        {
          error: `Invalid type value. It must be one of: ${validTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    if (
      data.semester &&
      !validSemesters.includes(capitalizeEachWord(data.semester) as Semester)
    ) {
      return NextResponse.json(
        {
          error: `Invalid semester value. It must be one of: ${validSemesters.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    if (data.courseSubjects) {
      if (data.courseSubjects.length <= 0) {
        return NextResponse.json(
          {
            error: "Courses are required. Please add one or more.",
          },
          { status: 400 }
        );
      }

      const invalid = data.courseSubjects.find((courseSubjects, i) => {
        if (
          typeof courseSubjects !== "object" ||
          typeof courseSubjects.courseId !== "number" ||
          typeof courseSubjects.year !== "number"
        ) {
          return true; // this course is invalid
        }
        return false;
      });

      if (invalid) {
        return NextResponse.json(
          {
            error:
              "Invalid course entry. Expected { courseId: number, year: number }",
          },
          { status: 400 }
        );
      }
    }
  },
  transform: (data) => {
    const transformed: any = { ...data };

    if (data.code) transformed.code = toUppercase(data.code);

    if (data.name) transformed.name = capitalizeEachWord(data.name);

    if (data.semester)
      transformed.semester = capitalizeEachWord(data.semester) as Semester;

    if (data.type)
      transformed.type = capitalizeEachWord(data.type) as CategoryType;

    if (data.courseSubjects) {
      transformed.courseSubjects = {
        create: data.courseSubjects.map((c: any) => ({
          year: c.year,
          course: {
            connect: { id: c.courseId },
          },
        })),
      };
    }

    return transformed;
  },
});

export const GET = createApiHandler(handlers.GET);
export const POST = createApiHandler(handlers.POST);
