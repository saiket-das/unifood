import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.services";
import httpStatus from "http-status";

// LOGIN (Students, Owner, Staff)
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUserService(req.body);
  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login successful",
    data: result,
  });
});

// Change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await AuthServices.changePasswordService(
    req.user!.userId,
    currentPassword,
    newPassword
  );

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password changed successfully",
    data: result,
  });
});

export const AuthControllers = {
  login,
  changePassword,
};
