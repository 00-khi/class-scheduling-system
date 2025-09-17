import { NextResponse } from "next/server";
import { FieldType, validateRequestBody } from "./api-validator";
import { prisma } from "@/lib/prisma";

type CollectionHandlerOptions<T> = {
  model: keyof typeof prisma;
  include?: object;
  select?: object;
  orderBy?: object;
  requiredFields?: { key: keyof T; type: FieldType }[];
  validateCreate?: (rawData: Partial<T>) => Promise<NextResponse | void>;
  transform?: (rawData: Partial<T>) => any; // format before saving
  formatResponse?: (entity: any) => any;
};

export function createEntityCollectionHandlers<T>(
  options: CollectionHandlerOptions<T>
) {
  const {
    model,
    include,
    select,
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
        select,
        orderBy,
      });

      return NextResponse.json(
        formatResponse
          ? await Promise.all(entities.map((e: any) => formatResponse(e)))
          : entities
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
        formatResponse ? await formatResponse(newEntity) : newEntity,
        { status: 201 }
      );
    },
  };
}
