import bcrypt from "bcryptjs";
import { generateToken } from "./auth.utils";
import { UserModel } from "../../modules/user/user.model";
import config from "../../config";
import AppError from "../../errors/AppError";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

// Student registration
export const registerStudentService = async (payload: RegisterPayload) => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) throw new AppError(400, "Email already exists");

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    role: "STUDENT",
  });

  const token = generateToken(
    { userId: user._id.toString(), role: user.role as string },
    config.jwt_secret as string,
    config.jwt_expires_in as string
  );

  return { user, token };
};

// Restaurant Owner registration
export const registerOwnerService = async (payload: RegisterPayload) => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) throw new AppError(400, "Email already exists");

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    role: "OWNER",
  });

  const token = generateToken(
    { userId: user._id.toString(), role: user.role as string },
    config.jwt_secret as string,
    config.jwt_expires_in as string
  );

  return { user, token };
};

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

  return { user, token };
};

export const AuthServices = {
  registerStudentService,
  registerOwnerService,
  loginUserService,
};
