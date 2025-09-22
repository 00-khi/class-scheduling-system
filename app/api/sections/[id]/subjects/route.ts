import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityHandlers } from "@/lib/api/entity-handler";
import { prisma } from "@/lib/prisma";
import { Section } from "@prisma/client";

const handlers = createEntityHandlers<Section>({
  model: "section",
  include: {
    course: true,
  },
  formatResponse: async (section) => {
    const courseSubjects = await prisma.courseSubject.findMany({
      where: { courseId: section.courseId, year: section.year },
      include: {
        subject: {
          include: {
            scheduledSubject: {
              where: { sectionId: section.id },
            },
          },
        },
      },
    });

    return courseSubjects.map((cs) => cs.subject);
  },
});

export const GET = createApiHandler(handlers.GET);
