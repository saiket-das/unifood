import { Types } from "mongoose";

export interface RestaurantProps {
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
