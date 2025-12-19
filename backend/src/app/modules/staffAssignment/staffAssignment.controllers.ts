import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StaffAssignmentServices } from "./staffAssignment.services";

// Create staff and assignment
const createStaff = catchAsync(async (req: Request, res: Response) => {
  const result = await StaffAssignmentServices.createStaffAndAssignmentService(
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Staff created successfully",
    data: result,
  });
});

// Get all staff assignments
const getStaffAssignments = catchAsync(async (req: Request, res: Response) => {
  const { branchId, isActive } = req.query;

  const result = await StaffAssignmentServices.getStaffAssignmentsService(
    req.user!.userId,
    branchId as string,
    isActive === "true" ? true : isActive === "false" ? false : undefined
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Staff assignments retrieved successfully",
    data: result,
  });
});

// Update staff assignment
const updateAssignment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await StaffAssignmentServices.updateAssignmentService(
    id,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Staff assignment updated successfully",
    data: result,
  });
});

// Deactivate staff
const deactivateStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await StaffAssignmentServices.deactivateStaffService(
    id,
    req.user!.userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Staff deactivated successfully",
    data: result,
  });
});

// Reset staff password
const resetStaffPassword = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await StaffAssignmentServices.resetStaffPasswordService(
    id,
    req.user!.userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Staff password reset successfully",
    data: result,
  });
});

export const StaffAssignmentControllers = {
  createStaff,
  getStaffAssignments,
  updateAssignment,
  deactivateStaff,
  resetStaffPassword,
};
