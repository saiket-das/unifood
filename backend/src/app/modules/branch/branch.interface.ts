import { Types } from "mongoose";

export interface BranchProps {
  restaurantId: Types.ObjectId;
  name: string;
  address: string;
  location?: {
    lat?: number;
    lng?: number;
  };
  isActive?: boolean;
}
