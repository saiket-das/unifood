import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.services";
import AppError from "../../errors/AppError";

const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.registerStudentService(req.body);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Student registered successfully",
    data: result,
  });
});

const registerOwner = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.registerOwnerService(req.body);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Restaurant owner registered successfully",
    data: result,
  });
});

// Get current logged-in user
const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }
  const data = await UserServices.getMeService(user);
  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Get current user successfully!",
    data,
  });
});

// Change user status
const changeStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedUser = await UserServices.changeStatusService(id, status);
  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully!",
    data: updatedUser,
  });
});

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.query;
  const users = await UserServices.getAllUsersService(role as string);
  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users fetched successfully!",
    data: users,
  });
});

// Delete a user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await UserServices.deleteUserService(id);
  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully!",
    data: deleted,
  });
});

export const UserControllers = {
  registerStudent,
  registerOwner,
  getMe,
  changeStatus,
  getAllUsers,
  deleteUser,
};
