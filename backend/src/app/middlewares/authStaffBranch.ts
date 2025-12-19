import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import { USER_ROLES } from "../types/user";
import { StaffAssignmentModel } from "../modules/staffAssignment/staffAssignment.model";
import { getNestedProperty } from "../helpers/getNestedProperty";

/**
 * Middleware to verify staff has access to specific branch
 * @param branchIdPath - Path to branchId in request (e.g., 'query.branchId', 'body.branchId', 'params.branchId')
 */
export const authStaffBranch = (branchIdPath: string = "query.branchId") => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, role } = req.user!;

    // Owners bypass this check (they own all branches)
    if (role === USER_ROLES.OWNER) {
      return next();
    }

    // Get branchId from request based on path
    const branchId = getNestedProperty(req, branchIdPath);

    if (!branchId) {
      throw new AppError(httpStatus.BAD_REQUEST, "Branch ID is required");
    }

    // Verify staff assignment
    const assignment = await StaffAssignmentModel.findOne({
      staffId: userId,
      branchIds: branchId, // MongoDB checks if branchId is in array
      isActive: true,
    });

    if (!assignment) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not assigned to this branch"
      );
    }

    // Attach assignment to request for downstream permission checks
    req.staffAssignment = assignment as any;

    next();
  });
};

export default authStaffBranch;
