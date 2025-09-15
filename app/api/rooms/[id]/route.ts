import { createApiHandler } from "@/lib/api/api-handler";
import { createEntityHandlers } from "@/lib/api/entity-handler";
import { capitalizeEachWord } from "@/lib/utils";
import { Room, RoomType } from "@prisma/client";
import { NextResponse } from "next/server";

const handlers = createEntityHandlers<Room>({
  model: "room",
  allowedFields: [
    { key: "name", type: "string" },
    { key: "type", type: "string" },
  ],
  validateUpdate: async (data) => {
    const validRoomTypes = Object.values(RoomType);

    if (
      data.type &&
      !validRoomTypes.includes(capitalizeEachWord(data.type) as RoomType)
    ) {
      return NextResponse.json(
        {
          error: `Invalid room type value. It must be one of: ${validRoomTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }
  },
  transform: (data) => {
    const transformed = { ...data };

    if (data.name) transformed.name = capitalizeEachWord(data.name);

    if (data.type) transformed.type = capitalizeEachWord(data.type) as RoomType;

    return transformed;
  },
});

export const GET = createApiHandler(handlers.GET);
export const PUT = createApiHandler(handlers.PUT);
export const DELETE = createApiHandler(handlers.DELETE);
