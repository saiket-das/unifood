import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import { UserModel } from "./user.model";
import { RegisterPayload } from "../auth/auth.interface";
import { USER_APPS, USER_ROLES } from "../../types/user";

export const registerStudentService = async (payload: RegisterPayload) => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) throw new AppError(400, "Email already exists");

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: USER_ROLES.STUDENT,
    allowedApps: [USER_APPS.FOOD_APP],
  });

  return user;
};

export const registerOwnerService = async (payload: RegisterPayload) => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) throw new AppError(400, "Email already exists");

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: USER_ROLES.OWNER,
    allowedApps: [USER_APPS.OWNER_DASHBOARD],
  });

  return user;
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
  registerStudentService,
  registerOwnerService,
  getMeService,
  changeStatusService,
  getAllUsersService,
  deleteUserService,
};
