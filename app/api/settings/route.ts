import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all settings
export async function GET() {
  const settings = await prisma.setting.findMany();
  return NextResponse.json(settings);
}

// UPDATE or CREATE setting
export async function POST(req: Request) {
  const { key, value } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "Key required" }, { status: 400 });
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json(setting);
}
