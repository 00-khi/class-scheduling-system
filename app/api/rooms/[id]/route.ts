import { createApiHandler } from "@/lib/api/api-handler";
import {
  validateIdParam,
  validatePartialRequestBody,
} from "@/lib/api/api-validator";
import { prisma } from "@/lib/prisma";
import { capitalizeEachWord } from "@/lib/utils";
import { Room, RoomType } from "@prisma/client";
import { NextResponse } from "next/server";

export const GET = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  return NextResponse.json(room);
});

export const PUT = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  if (!request) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } = await validatePartialRequestBody<Room>(request, [
    { key: "name", type: "string" },
    { key: "type", type: "string" },
  ]);

  if (error) return error;

  const updatedData: any = {};

  const validRoomTypes = Object.values(RoomType);

  if (data.name) {
    updatedData.name = capitalizeEachWord(data.name);
  }

  if (data.type) {
    if (!validRoomTypes.includes(data.type)) {
      return NextResponse.json(
        {
          error: `Invalid room type value. It must be one of: ${validRoomTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    updatedData.status = capitalizeEachWord(data.type) as RoomType;
  }

  const updatedRoom = await prisma.room.update({
    where: { id },
    data: updatedData,
  });

  return NextResponse.json(updatedRoom);
});

export const DELETE = createApiHandler(async (request, context) => {
  const { id, invalidId } = await validateIdParam(context);
  if (invalidId) return invalidId;

  await prisma.room.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Room deleted successfully." });
});
