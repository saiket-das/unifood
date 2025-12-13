import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "@app/utils/catchAsync";
import sendResponse from "@app/utils/sendResponse";
import { registerUserService, loginUserService } from "./auth.service";

// Register
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const user = await registerUserService(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: user,
  });
});

// Login
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const data = await loginUserService(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login successful",
    data,
  });
});
