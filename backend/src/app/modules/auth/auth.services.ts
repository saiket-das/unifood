import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { generateToken } from "./auth.utils";
import { UserModel } from "../../modules/user/user.model";
import config from "../../config";
import AppError from "../../errors/AppError";
import { LoginPayload } from "./auth.interface";

// Login service (student or owner)
export const loginUserService = async (payload: LoginPayload) => {
  const user = await UserModel.findOne({ email: payload.email });
  if (!user) throw new AppError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials");

  const token = generateToken(
    { userId: user._id.toString(), role: user.role! },
    config.jwt_secret as string,
    config.jwt_expires_in as string
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// Change password service
export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Find user with password
  const user = await UserModel.isUserExists(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Verify current password
  const isPasswordMatched = await UserModel.isPasswordMatched(
    currentPassword,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Current password is incorrect");
  }

  // Update password and clear mustChangePassword flag
  await UserModel.findByIdAndUpdate(userId, {
    password: await bcrypt.hash(newPassword, 10),
    mustChangePassword: false,
  });

  return { message: "Password changed successfully" };
};

export const AuthServices = {
  loginUserService,
  changePasswordService,
};
