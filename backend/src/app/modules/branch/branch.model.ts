import { Schema, model } from "mongoose";
import { BranchProps } from "./branch.interface";

const branchSchema = new Schema<BranchProps>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const BranchModel = model<BranchProps>("Branch", branchSchema);
