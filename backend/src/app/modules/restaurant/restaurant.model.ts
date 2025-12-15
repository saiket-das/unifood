import { Schema, model } from "mongoose";
import { RestaurantProps } from "./restaurant.interface";

const restaurantSchema = new Schema<RestaurantProps>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    logo: { type: String },
  },
  { timestamps: true }
);

export const RestaurantModel = model<RestaurantProps>(
  "Restaurant",
  restaurantSchema
);
