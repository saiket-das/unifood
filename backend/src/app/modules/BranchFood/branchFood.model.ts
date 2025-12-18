import { Schema, model, Types } from "mongoose";

const branchFoodSchema = new Schema(
  {
    branchId: {
      type: Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    foodId: {
      type: Types.ObjectId,
      ref: "Food",
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate food in same branch
branchFoodSchema.index({ branchId: 1, foodId: 1 }, { unique: true });

export const BranchFoodModel = model("BranchFood", branchFoodSchema);
