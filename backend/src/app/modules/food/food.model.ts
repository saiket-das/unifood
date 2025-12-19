import { Schema, model } from "mongoose";
import { FoodProps, StaticFoodModel } from "./food.interface";

const foodSchema = new Schema<FoodProps>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    photo: { type: String },
  },
  { timestamps: true }
);

export const FoodModel = model<FoodProps, StaticFoodModel>("Food", foodSchema);
