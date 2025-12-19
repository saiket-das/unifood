import { Schema, model, Types } from "mongoose";
import { StaffAssignmentProps } from "./staffAssignment.interface";

const staffAssignmentSchema = new Schema<StaffAssignmentProps>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Staff ID is required"],
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
    },
    branchIds: {
      type: [Schema.Types.ObjectId],
      ref: "Branch",
      required: [true, "At least one branch is required"],
      validate: {
        validator: function (value: Types.ObjectId[]) {
          return value && value.length > 0;
        },
        message: "At least one branch must be assigned",
      },
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned by is required"],
    },
    permissions: {
      canManageOrders: {
        type: Boolean,
        default: true,
      },
      canUpdateFoodAvailability: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
staffAssignmentSchema.index({ restaurantId: 1, isActive: 1 });
staffAssignmentSchema.index({ staffId: 1, isActive: 1 });

export const StaffAssignmentModel = model<StaffAssignmentProps>(
  "StaffAssignment",
  staffAssignmentSchema
);
