import { NextResponse } from "next/server";
import { validateIdParam } from "./api-validator";
import { validatePartialRequestBody, FieldType } from "./api-validator";
import { prisma } from "@/lib/prisma";
import { splitCamelCaseAndNumbers } from "../utils";

type HandlerOptions<T> = {
  model: keyof typeof prisma; // Prisma model name, e.g. "instructor"
  include?: object; // Prisma include if needed
  allowedFields?: { key: keyof T; type: FieldType }[]; // For PUT
  validateUpdate?: (data: Partial<T>) => Promise<NextResponse | void>; // custom validation logic
  transform: (rawData: Partial<T>) => any; // format before saving
  formatResponse?: (entity: any) => any; // optional formatter
};

export function createEntityHandlers<T>(options: HandlerOptions<T>) {
  const {
    model,
    include,
    allowedFields,
    validateUpdate,
    transform,
    formatResponse,
  } = options;

  const modelDelegate = (prisma as any)[model];

  return {
    GET: async (_req: Request, context: any) => {
      const { id, invalidId } = await validateIdParam(context);
      if (invalidId) return invalidId;

      const entity = await modelDelegate.findUnique({
        where: { id },
        include,
      });

      if (!entity) {
        return NextResponse.json(
          { error: `${splitCamelCaseAndNumbers(String(model))} not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        formatResponse ? formatResponse(entity) : entity
      );
    },

    PUT: async (req: Request, context: any) => {
      const { id, invalidId } = await validateIdParam(context);
      if (invalidId) return invalidId;

      if (!req) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      const { data, error: bodyError } = await validatePartialRequestBody<T>(
        req,
        allowedFields || []
      );
      if (bodyError) return bodyError;

      if (validateUpdate) {
        const validationError = await validateUpdate(data);
        if (validationError) return validationError;
      }

      // Transform the data before saving if transformUpdate exists
      const transformedData = transform ? transform(data) : data;

      const updatedEntity = await modelDelegate.update({
        where: { id },
        data: transformedData,
      });

      return NextResponse.json(
        formatResponse ? formatResponse(updatedEntity) : updatedEntity
      );
    },

    DELETE: async (_req: Request, context: any) => {
      const { id, invalidId } = await validateIdParam(context);
      if (invalidId) return invalidId;

      await modelDelegate.delete({ where: { id } });

      return NextResponse.json({
        message: `${splitCamelCaseAndNumbers(String(model))} deleted successfully.`,
      });
    },
  };
}
