import httpStatus from "http-status";
import crypto from "crypto";
import AppError from "../../errors/AppError";
import { StaffAssignmentModel } from "./staffAssignment.model";
import { CreateStaffPayload, UpdateAssignmentPayload } from "./staffAssignment.interface";
import { RestaurantModel } from "../restaurant/restaurant.model";
import { BranchModel } from "../branch/branch.model";
import { UserModel } from "../user/user.model";
import { USER_ROLES, USER_APPS } from "../../types/user";

// Generate temporary password
const generateTemporaryPassword = (): string => {
  // Generate a random 12-character password
  return crypto.randomBytes(6).toString("hex") + "Temp!";
};

// Create staff user and assignment in one transaction
export const createStaffAndAssignmentService = async (
  ownerId: string,
  payload: CreateStaffPayload
) => {
  // 1. Verify owner owns a restaurant
  const restaurant = await RestaurantModel.findOne({ ownerId });
  if (!restaurant) {
    throw new AppError(httpStatus.NOT_FOUND, "Restaurant not found");
  }

  // 2. Verify all branches belong to owner's restaurant
  const branches = await BranchModel.find({
    _id: { $in: payload.branchIds },
    restaurantId: restaurant._id,
  });

  if (branches.length !== payload.branchIds.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "One or more branches are invalid or do not belong to your restaurant"
    );
  }

  // 3. Check if email already exists
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A user with this email already exists"
    );
  }

  // 4. Generate temporary password
  const temporaryPassword = generateTemporaryPassword();

  // 5. Create staff user
  const staffUser = await UserModel.create({
    name: payload.name,
    email: payload.email,
    password: temporaryPassword,
    role: USER_ROLES.STAFF,
    status: "ACTIVE",
    allowedApps: [USER_APPS.OWNER_DASHBOARD],
    mustChangePassword: true,
  });

  // 6. Create staff assignment
  const assignment = await StaffAssignmentModel.create({
    staffId: staffUser._id,
    restaurantId: restaurant._id,
    branchIds: payload.branchIds,
    assignedBy: ownerId,
    permissions: payload.permissions || {
      canManageOrders: true,
      canUpdateFoodAvailability: true,
    },
    isActive: true,
  });

  // 7. Return staff details and temporary password
  return {
    staff: {
      id: staffUser._id,
      name: staffUser.name,
      email: staffUser.email,
      role: staffUser.role,
    },
    temporaryPassword,
    assignment,
  };
};

// Get all staff assignments for owner's restaurant
export const getStaffAssignmentsService = async (
  ownerId: string,
  branchId?: string,
  isActive?: boolean
) => {
  // Find owner's restaurant
  const restaurant = await RestaurantModel.findOne({ ownerId });
  if (!restaurant) {
    throw new AppError(httpStatus.NOT_FOUND, "Restaurant not found");
  }

  // Build query
  const query: any = { restaurantId: restaurant._id };

  if (branchId) {
    query.branchIds = branchId;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  // Fetch assignments with populated data
  const assignments = await StaffAssignmentModel.find(query)
    .populate("staffId", "name email status")
    .populate("branchIds", "name address")
    .sort({ createdAt: -1 });

  return assignments;
};

// Update staff assignment
export const updateAssignmentService = async (
  assignmentId: string,
  ownerId: string,
  payload: UpdateAssignmentPayload
) => {
  // Find assignment
  const assignment = await StaffAssignmentModel.findById(assignmentId).populate(
    "restaurantId"
  );

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, "Staff assignment not found");
  }

  // Verify ownership
  if ((assignment.restaurantId as any).ownerId.toString() !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this assignment"
    );
  }

  // If updating branches, verify they belong to restaurant
  if (payload.branchIds && payload.branchIds.length > 0) {
    const branches = await BranchModel.find({
      _id: { $in: payload.branchIds },
      restaurantId: assignment.restaurantId,
    });

    if (branches.length !== payload.branchIds.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "One or more branches are invalid"
      );
    }

    assignment.branchIds = payload.branchIds as any;
  }

  // Update permissions if provided
  if (payload.permissions) {
    assignment.permissions = {
      ...assignment.permissions,
      ...payload.permissions,
    };
  }

  // Update isActive if provided
  if (payload.isActive !== undefined) {
    assignment.isActive = payload.isActive;
  }

  await assignment.save();

  return assignment;
};

// Deactivate staff assignment
export const deactivateStaffService = async (
  assignmentId: string,
  ownerId: string
) => {
  const assignment = await StaffAssignmentModel.findById(assignmentId).populate(
    "restaurantId"
  );

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, "Staff assignment not found");
  }

  // Verify ownership
  if ((assignment.restaurantId as any).ownerId.toString() !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to deactivate this assignment"
    );
  }

  // Soft delete
  assignment.isActive = false;
  await assignment.save();

  // Optionally set user status to inactive
  await UserModel.findByIdAndUpdate(assignment.staffId, { status: "INACTIVE" });

  return assignment;
};

// Reset staff password
export const resetStaffPasswordService = async (
  assignmentId: string,
  ownerId: string
) => {
  const assignment = await StaffAssignmentModel.findById(assignmentId).populate(
    "restaurantId"
  );

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, "Staff assignment not found");
  }

  // Verify ownership
  if ((assignment.restaurantId as any).ownerId.toString() !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to reset this password"
    );
  }

  // Generate new temporary password
  const temporaryPassword = generateTemporaryPassword();

  // Update user password and set mustChangePassword flag
  const user = await UserModel.findById(assignment.staffId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Staff user not found");
  }

  user.password = temporaryPassword;
  user.mustChangePassword = true;
  await user.save();

  return { temporaryPassword };
};

export const StaffAssignmentServices = {
  createStaffAndAssignmentService,
  getStaffAssignmentsService,
  updateAssignmentService,
  deactivateStaffService,
  resetStaffPasswordService,
};
