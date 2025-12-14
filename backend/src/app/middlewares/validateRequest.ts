import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import catchAsync from "../utils/catchAsync";

const validateRequest = (schema: ZodObject<any>) => {
  return catchAsync(async (req, res, next) => {
    await schema.parseAsync(req.body);
    next();
  });
};

export default validateRequest;
