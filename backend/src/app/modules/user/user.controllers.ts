import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@app/utils/catchAsync";
import sendResponse from "@app/utils/sendResponse";
import { UserServices } from "./user.services";
import AppError from "@app/errors/AppError";

// Create a new user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = await UserServices.createUserService(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully!",
    data: user,
  });
});

// Get current logged-in user
const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }
  const data = await UserServices.getMeService(user);
  sendResponse(res, {
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
  sendResponse(res, {
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
  sendResponse(res, {
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
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully!",
    data: deleted,
  });
});

export const UserControllers = {
  createUser,
  getMe,
  changeStatus,
  getAllUsers,
  deleteUser,
};
