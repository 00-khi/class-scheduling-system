import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityHandlers } from "@/lib/api/entity-handler";
import { prisma } from "@/lib/prisma";
import { diffMinutes } from "@/lib/schedule-utils";
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

    return courseSubjects
      .map((cs) => {
        const subject = cs.subject;

        const scheduledMinutes = subject.scheduledSubject.reduce(
          (sum, sched) => sum + diffMinutes(sched.startTime, sched.endTime),
          0
        );

        const requiredMinutes = subject.units * 60;

        return {
          ...subject,
          scheduledMinutes,
          requiredMinutes,
        };
      })
      .filter((s) => s.scheduledMinutes < s.requiredMinutes);
    // .filter((s) => s.scheduledMinutes !== s.requiredMinutes); // keep incomplete or excess only
  },
});

export const GET = createApiHandler(handlers.GET);
