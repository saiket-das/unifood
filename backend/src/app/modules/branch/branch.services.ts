import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import { BranchModel } from "./branch.model";
import { RestaurantModel } from "../restaurant/restaurant.model";
import { BranchProps } from "./branch.interface";

const createBranchService = async (user: JwtPayload, payload: BranchProps) => {
  // Ensure restaurant exists and belongs to owner
  const restaurant = await RestaurantModel.findOne({
    _id: payload.restaurantId,
    ownerId: user.userId,
  });

  if (!restaurant) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Restaurant not found or unauthorized"
    );
  }

  const branch = await BranchModel.create(payload);
  return branch;
};

const getBranchesByRestaurantService = async (restaurantId: string) => {
  return BranchModel.find({ restaurantId });
};

const updateBranchService = async (
  branchId: string,
  payload: Partial<BranchProps>
) => {
  const branch = await BranchModel.findByIdAndUpdate(branchId, payload, {
    new: true,
  });

  if (!branch) {
    throw new AppError(httpStatus.NOT_FOUND, "Branch not found");
  }

  return branch;
};

export const BranchServices = {
  createBranchService,
  getBranchesByRestaurantService,
  updateBranchService,
};
