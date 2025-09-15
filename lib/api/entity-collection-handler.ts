import { NextResponse } from "next/server";
import { FieldType, validateRequestBody } from "./api-validator";
import { prisma } from "@/lib/prisma";

type CollectionHandlerOptions<T> = {
  model: keyof typeof prisma;
  include?: object;
  orderBy?: object;
  requiredFields?: { key: keyof T; type: FieldType }[];
  validateCreate?: (rawData: T) => Promise<NextResponse | void>;
  transform: (rawData: T) => any; // format before saving
  formatResponse?: (entity: any) => any;
};

export function createEntityCollectionHandlers<T>(
  options: CollectionHandlerOptions<T>
) {
  const {
    model,
    include,
    orderBy,
    requiredFields,
    validateCreate,
    transform,
    formatResponse,
  } = options;

  const modelDelegate = (prisma as any)[model];

  return {
    GET: async () => {
      const entities = await modelDelegate.findMany({
        include,
        orderBy,
      });

      return NextResponse.json(
        formatResponse ? entities.map(formatResponse) : entities
      );
    },

    POST: async (req: Request) => {
      if (!req) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      const { rawData, error } = await validateRequestBody<T>(
        req,
        requiredFields || []
      );
      if (error) return error;

      if (validateCreate) {
        const validationError = await validateCreate(rawData);
        if (validationError) return validationError;
      }

      const data = transform ? transform(rawData) : rawData;

      const newEntity = await modelDelegate.create({
        data,
      });

      return NextResponse.json(
        formatResponse ? formatResponse(newEntity) : newEntity,
        { status: 201 }
      );
    },
  };
}
