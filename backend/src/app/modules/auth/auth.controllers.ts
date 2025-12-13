import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.services";
import httpStatus from "http-status";

// Student Registration
const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerStudentService(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Student registered successfully",
    data: result,
  });
});

// Restaurant Owner Registration
const registerOwner = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerOwnerService(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Restaurant owner registered successfully",
    data: result,
  });
});

// Login
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUserService(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login successful",
    data: result,
  });
});

export const AuthControllers = {
  registerStudent,
  registerOwner,
  login,
};
