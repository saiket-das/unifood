import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import { UserModel } from "./user.model";
import { UserProps } from "./user.interface";

// Get current user
const getMeService = async (user: JwtPayload) => {
  const existingUser = await UserModel.findById(user.userId);
  if (!existingUser)
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  return existingUser;
};

// Update user status
const changeStatusService = async (userId: string, status: string) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  );
  if (!updatedUser) throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  return updatedUser;
};

// Get all users (optional: filter by role)
const getAllUsersService = async (role?: string) => {
  const query: any = {};
  if (role) query.role = role;
  return await UserModel.find(query).sort({ createdAt: -1 });
};

// Delete a user
const deleteUserService = async (userId: string) => {
  const deleted = await UserModel.findByIdAndDelete(userId);
  if (!deleted) throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  return deleted;
};

export const UserServices = {
  getMeService,
  changeStatusService,
  getAllUsersService,
  deleteUserService,
};
