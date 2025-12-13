import { UserModel } from "./user.model";
import { IUser } from "./user.interface";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { JwtPayload } from "jsonwebtoken";

// Create a new user (student / owner / staff)
const createUserService = async (payload: Partial<IUser>) => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "Email already exists!");
  }

  const newUser = await UserModel.create(payload);
  if (!newUser)
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to create user!");
  return newUser;
};

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
  createUserService,
  getMeService,
  changeStatusService,
  getAllUsersService,
  deleteUserService,
};
