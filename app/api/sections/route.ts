import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityCollectionHandlers } from "@/lib/api/entity-collection-handler";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Semester, Section } from "@prisma/client";
import { capitalizeEachWord } from "@/lib/utils";

// --- utils ---
function toLetters(num: number): string {
  let result = "";
  while (num >= 0) {
    result = String.fromCharCode((num % 26) + 65) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
}

// --- handlers ---
const handlers = createEntityCollectionHandlers<
  Section & { totalSections: number }
>({
  model: "section",
  include: {
    course: {
      include: {
        academicLevel: true,
      },
    },
  },
  orderBy: { updatedAt: "desc" },
  requiredFields: [
    { key: "courseId", type: "number" },
    { key: "year", type: "number" },
    { key: "semester", type: "string" },
    { key: "totalSections", type: "number" },
  ],

  validateCreate: async (data) => {
    const validSemesters = Object.values(Semester);
    if (
      data.semester &&
      !validSemesters.includes(capitalizeEachWord(data.semester) as Semester)
    ) {
      return NextResponse.json(
        {
          error: `Invalid semester. Must be one of: ${validSemesters.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }
    if (data.totalSections !== undefined && data.totalSections < 0) {
      return NextResponse.json(
        { error: "totalSections must be negative" },
        { status: 400 }
      );
    }
  },

  transform: async (data) => {
    const course = await prisma.course.findUniqueOrThrow({
      where: { id: data.courseId },
    });

    const existingSections = await prisma.section.findMany({
      where: {
        courseId: data.courseId,
        year: data.year,
        semester: capitalizeEachWord(data.semester || "") as Semester,
      },
      orderBy: { name: "asc" },
    });

    const existingNames = existingSections.map((s) => s.name);

    // target list of names
    const targetNames: string[] = [];
    for (let i = 0; i < (data.totalSections || 0); i++) {
      const suffix = toLetters(i); // A, B, C... AA...
      const name = `${course.code}${data.year}0${
        capitalizeEachWord(data.semester || "") === "First" ? 1 : 2
      }${suffix}`;
      targetNames.push(name);
    }

    const toInsert = targetNames.filter((n) => !existingNames.includes(n));
    const toDelete = existingNames.filter((n) => !targetNames.includes(n));

    // add new sections, uncomment this if mag error yung createMany sa baba, then ireturn null dun
    // for (const name of toInsert) {
    //   await prisma.section.create({
    //     data: {
    //       name,
    //       year: data.year || 0,
    //       semester: capitalizeEachWord(data.semester || "") as Semester,
    //       courseId: data.courseId || 0,
    //     },
    //   });
    // }

    // remove extra sections
    if (toDelete.length > 0) {
      await prisma.section.deleteMany({
        where: {
          courseId: data.courseId,
          year: data.year,
          semester: capitalizeEachWord(data.semester || "") as Semester,
          name: { in: toDelete },
        },
      });
    }

    // return nothing since entity-collection-handler will send response
    return {
      createMany: {
        data: toInsert.map((name) => ({
          name,
          year: data.year || 0,
          semester: capitalizeEachWord(data.semester || "") as Semester,
          courseId: data.courseId || 0,
        })),
      },
    };
  },
});

export const GET = createApiHandler(handlers.GET);
export const POST = createApiHandler(handlers.POST);
