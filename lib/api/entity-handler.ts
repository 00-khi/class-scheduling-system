import { NextResponse } from "next/server";
import { validateIdParam } from "./api-validator";
import { validatePartialRequestBody, FieldType } from "./api-validator";
import { prisma } from "@/lib/prisma";

type HandlerOptions<T> = {
  model: keyof typeof prisma; // Prisma model name, e.g. "instructor"
  include?: object; // Prisma include if needed
  allowedFields?: { key: keyof T; type: FieldType }[]; // For PUT
  validateUpdate?: (data: Partial<T>) => Promise<NextResponse | void>; // custom validation logic
  formatResponse?: (entity: any) => any; // optional formatter
};

export function createEntityHandlers<T>(options: HandlerOptions<T>) {
  const { model, include, allowedFields, validateUpdate, formatResponse } =
    options;

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
          { error: `${String(model)} not found.` },
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

      const updatedEntity = await modelDelegate.update({
        where: { id },
        data,
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
        message: `${String(model)} deleted successfully.`,
      });
    },
  };
}
