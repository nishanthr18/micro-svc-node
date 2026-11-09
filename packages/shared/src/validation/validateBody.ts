import type { ZodSchema } from "zod/v3";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const validateBody = (schema: ZodSchema) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(
          400,
          result.error.errors[0].message,
          true
        )
      );
    }

    req.body = result.data;

    next();
  };
};