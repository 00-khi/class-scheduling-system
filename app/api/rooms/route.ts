import { createApiHandler } from "@/lib/api/api-handler";
import { validateRequestBody } from "@/lib/api/api-validator";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord } from "@/lib/utils";
import { Room, RoomType } from "@prisma/client";
import { request } from "http";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async () => {
  const rooms = await prisma.room.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(rooms);
});

export const POST = createApiHandler(async (request) => {
  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { rawData, error } = await validateRequestBody<Room>(request, [
    { key: "name", type: "string" },
    { key: "type", type: "string" },
  ]);

  if (error) return error;

  const name = capitalizeEachWord(rawData.name);
  const type = capitalizeEachWord(rawData.type) as RoomType;

  const validRoomTypes = Object.values(RoomType);

  if (!validRoomTypes.includes(type)) {
    return NextResponse.json(
      {
        error: `Invalid room type value. It must be one of: ${validRoomTypes.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  const data = { name, type };

  const newRoom = await prisma.room.create({
    data,
  });

  return NextResponse.json(newRoom, { status: 201 });
});
