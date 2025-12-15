// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import AppError from "../errors/AppError";
import config from "../config";
import { UserRoleProps } from "../types/user";
import catchAsync from "../utils/catchAsync";
import { UserModel } from "../modules/user/user.model";

// Auth middleware factory to enforce roles
const auth = (...requireRoles: UserRoleProps[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    const token = authHeader.split(" ")[1];

    let decoded: JwtPayload & { userId: string; role: UserRoleProps };
    try {
      decoded = jwt.verify(
        token,
        config.jwt_secret as string
      ) as typeof decoded;
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token!");
    }

    const { userId, role } = decoded;

    // Check if role is allowed
    if (requireRoles.length && !requireRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized for this action!"
      );
    }

    // Check if user exists
    const user = await UserModel.isUserExists(userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found!");
    }

    // Check if user is deleted
    if ((user as any).isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, "This account is deleted!");
    }

    // Check if user is blocked / inactive
    if (user.status !== "ACTIVE") {
      throw new AppError(httpStatus.FORBIDDEN, "This account is not active!");
    }

    // Attach user to request
    req.user = decoded;

    next();
  });
};

export default auth;
