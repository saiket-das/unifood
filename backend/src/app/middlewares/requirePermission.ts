import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import { USER_ROLES } from "../types/user";
import { StaffPermissions } from "../modules/staffAssignment/staffAssignment.interface";

/**
 * Middleware to check specific permission from staff assignment
 * @param permission - The permission key to check (e.g., 'canManageOrders', 'canUpdateFoodAvailability')
 */
export const requirePermission = (permission: keyof StaffPermissions) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user!;

    // Owners have all permissions
    if (role === USER_ROLES.OWNER) {
      return next();
    }

    // Staff must have permission
    const assignment = req.staffAssignment;

    if (!assignment) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Staff assignment not found in request. Ensure authStaffBranch middleware is called first."
      );
    }

    if (!assignment.permissions[permission]) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `You do not have permission to perform this action`
      );
    }

    next();
  });
};

export default requirePermission;
