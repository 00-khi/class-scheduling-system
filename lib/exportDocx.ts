import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { getAssignedSubjectById } from "@/services/assignedSubjectService";
import { getSubjectById } from "@/services/subjectService";
import { getRooms } from "@/services/roomService";
import { IScheduledSubject } from "@/types";
import { ISectionOptions } from "docx";

const dayName = (d: string) => {
  const map: Record<string, string> = {
    "0": "Sunday",
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday",
  };
  return map[d] || "Unknown";
};

export async function exportScheduleDocx(
  title: string,
  note: string,
  items: IScheduledSubject[]
) {
  const rooms = getRooms();

  const sections: ISectionOptions[] = [
    {
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({ text: note }),
        new Paragraph({ text: "" }),
      ],
    },
  ];

  // group by day
  const byDay: Record<string, IScheduledSubject[]> = {};
  for (const it of items) {
    byDay[it.dayOfWeek] = byDay[it.dayOfWeek] || [];
    byDay[it.dayOfWeek].push(it);
  }

  // sort days numeric
  const dayKeys = Object.keys(byDay)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  for (const dk of dayKeys) {
    const k = String(dk);
    const list = byDay[k].sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
    sections.push({
      children: [
        new Paragraph({
          text: dayName(k),
          heading: HeadingLevel.HEADING_2,
        }),
      ],
    });

    for (const it of list) {
      const asg = getAssignedSubjectById(it.assignedSubjectId);
      const subj = asg ? getSubjectById(asg.subjectId) : undefined;
      const room = rooms.find((r) => r.id === it.roomId);
      const line = `${it.startTime} - ${it.endTime}, ${
        room?.name || "Unknown room"
      }, ${subj ? `${subj.code} - ${subj.title}` : "Unknown subject"}`;
      sections.push({
        children: [
          new Paragraph({
            children: [new TextRun(line)],
          }),
        ],
      });
    }
  }

  const doc = new Document({
    sections: sections,
  });

  const packer = await Packer.toBlob(doc);
  saveAs(packer, `${title || "custom-schedule"}.docx`);
}