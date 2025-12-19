import { Model, Types } from "mongoose";

export interface FoodProps {
  restaurantId: Types.ObjectId;
  branchId?: string | null; // optional, null means no branch
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
  categories?: string[];
  photo?: string; // Cloudinary URL
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StaticFoodModel extends Model<FoodProps> {}
