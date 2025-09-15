import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityHandlers } from "@/lib/api/entity-handler";
import { capitalizeEachWord, toUppercase } from "@/lib/utils";
import { RoomType, Semester, Subject } from "@prisma/client";
import { NextResponse } from "next/server";

const handlers = createEntityHandlers<
  Subject & { courses: [{ courseId: number; year: number }] }
>({
  model: "subject",
  include: {
    academicLevel: true,
    courses: {
      include: { course: true },
    },
  },
  allowedFields: [
    { key: "code", type: "string" },
    { key: "name", type: "string" },
    { key: "semester", type: "string" },
    { key: "units", type: "number" },
    { key: "type", type: "string" },
    { key: "academicLevelId", type: "number" },
    { key: "courses", type: "array" },
  ],
  validateUpdate: async (data) => {
    const validTypes = Object.values(RoomType);
    const validSemesters = Object.values(Semester);

    if (data.units !== undefined && data.units <= 0) {
      return NextResponse.json(
        {
          error: `Units must not be zero or negative`,
        },
        { status: 400 }
      );
    }

    if (
      data.type &&
      !validTypes.includes(capitalizeEachWord(data.type) as RoomType)
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

    if (data.courses) {
      if (data.courses.length <= 0) {
        return NextResponse.json(
          {
            error: "Courses are required. Please add one or more.",
          },
          { status: 400 }
        );
      }

      const invalid = data.courses.find((course, i) => {
        if (
          typeof course !== "object" ||
          typeof course.courseId !== "number" ||
          typeof course.year !== "number"
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

    if (data.type) transformed.type = capitalizeEachWord(data.type) as RoomType;

    if (data.courses) {
      transformed.courses = {
        deleteMany: {}, // clear all existing
        create: data.courses.map((c: any) => ({
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
export const PUT = createApiHandler(handlers.PUT);
export const DELETE = createApiHandler(handlers.DELETE);
