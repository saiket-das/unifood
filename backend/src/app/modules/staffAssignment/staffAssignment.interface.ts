import { Types } from "mongoose";

export interface StaffPermissions {
  canManageOrders: boolean;
  canUpdateFoodAvailability: boolean;
}

export interface StaffAssignmentProps {
  staffId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  branchIds: Types.ObjectId[];
  assignedBy: Types.ObjectId;
  permissions: StaffPermissions;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateStaffPayload {
  email: string;
  name: string;
  branchIds: string[];
  permissions?: StaffPermissions;
}

export interface UpdateAssignmentPayload {
  branchIds?: string[];
  permissions?: Partial<StaffPermissions>;
  isActive?: boolean;
}
