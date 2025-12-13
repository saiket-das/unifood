import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "@app/modules/user/user.model";
import AppError from "@app/errors/AppError";
import config from "@app/config";
import { LoginPayload, JwtPayloadCustom } from "./auth.interface";
import { IUser } from "@app/modules/user/user.interface";
import { generateToken } from "./auth.utils";

// Register a user
export const registerUserService = async (payload: Partial<IUser>) => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) throw new AppError(400, "User already exists");

  const hashedPassword = await bcrypt.hash(payload.password!, 12);

  const newUser = await UserModel.create({
    ...payload,
    password: hashedPassword,
  });

  return newUser;
};

// Login user and return JWT
export const loginUserService = async (payload: LoginPayload) => {
  const user = await UserModel.findOne({ email: payload.email });
  if (!user) throw new AppError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials");

  // Create JWT payload
  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role as string,
  };

  // Generate an access token
  const token = generateToken(
    jwtPayload,
    config.jwt_secret as string,
    config.jwt_expires_in as string
  );

  return { token, user };
};
