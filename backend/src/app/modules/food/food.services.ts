import { FoodModel } from "./food.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { sendImageToCloudinary } from "../../middlewares/sendImageToCloudinary";
import { RestaurantModel } from "../restaurant/restaurant.model";

export const createFoodService = async (
  payload: any,
  file?: Express.Multer.File
) => {
  // Check for duplicate
  const exists = await FoodModel.findOne({
    restaurantId: payload.restaurantId,
    branchId: payload.branchId || null,
    name: payload.name,
  });
  if (exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Food already exists for this restaurant/branch"
    );
  }

  // Upload photo if exists
  if (file) {
    const imageName = `food-${Date.now()}`;
    try {
      const uploadResult = await sendImageToCloudinary(file.path, imageName);
      payload.photo = uploadResult.secure_url; // save photo url
    } catch (err) {
      throw new AppError(500, "Failed to upload food image");
    }
  }

  return await FoodModel.create(payload);
};

// Get all foods
export const getFoodsService = async (
  restaurantId: string,
  branchId?: string
) => {
  const query: any = { restaurantId };
  if (branchId) {
    query.$or = [{ branchId }, { branchId: null }];
  }
  return await FoodModel.find(query).sort({ createdAt: -1 });
};

// Fetch foods for owner (by restaurant and optional branch)
export const getOwnerFoodsService = async (
  ownerId: string,
  branchId?: string
) => {
  // First get the restaurant of the owner
  const restaurant = await RestaurantModel.findOne({ ownerId });
  if (!restaurant) throw new AppError(404, "Restaurant not found");

  const query: any = { restaurantId: restaurant._id };

  if (branchId) {
    // If branch is specified, get foods for that branch AND foods without branch (global for restaurant)
    query.$or = [{ branchId }, { branchId: null }];
  }

  const foods = await FoodModel.find(query).sort({ createdAt: -1 });
  return foods;
};

export const updateFoodService = async (
  id: string,
  payload: any,
  file?: Express.Multer.File
) => {
  if (file) {
    const imageName = `food-${Date.now()}`;
    try {
      const uploadResult = await sendImageToCloudinary(file.path, imageName);
      payload.photo = uploadResult.secure_url;
    } catch (err) {
      throw new AppError(500, "Failed to upload food image");
    }
  }

  const food = await FoodModel.findByIdAndUpdate(id, payload, { new: true });
  if (!food) throw new AppError(httpStatus.NOT_FOUND, "Food not found");
  return food;
};

// Delete a food
export const deleteFoodService = async (id: string) => {
  const food = await FoodModel.findByIdAndDelete(id);
  if (!food) throw new AppError(httpStatus.NOT_FOUND, "Food not found");
};

// Get foods for staff (by branch)
export const getStaffFoodsService = async (
  staffId: string,
  branchId: string
) => {
  const { StaffAssignmentModel } = await import("../staffAssignment/staffAssignment.model");

  // Verify staff is assigned to this branch
  const assignment = await StaffAssignmentModel.findOne({
    staffId,
    branchIds: branchId,
    isActive: true,
  });

  if (!assignment) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not assigned to this branch");
  }

  // Get foods for this branch + restaurant-wide foods
  const query: any = {
    restaurantId: assignment.restaurantId,
    $or: [{ branchId }, { branchId: null }],
  };

  return await FoodModel.find(query).sort({ createdAt: -1 });
};

// Staff update food availability (ONLY isActive field)
export const staffUpdateFoodAvailabilityService = async (
  foodId: string,
  staffId: string,
  isActive: boolean
) => {
  const { StaffAssignmentModel } = await import("../staffAssignment/staffAssignment.model");

  // Find food
  const food = await FoodModel.findById(foodId);
  if (!food) {
    throw new AppError(httpStatus.NOT_FOUND, "Food not found");
  }

  // Verify staff is assigned to food's branch
  const assignment = await StaffAssignmentModel.findOne({
    staffId,
    branchIds: food.branchId,
    isActive: true,
  });

  if (!assignment) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this food item"
    );
  }

  // Check permission
  if (!assignment.permissions.canUpdateFoodAvailability) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update food availability"
    );
  }

  // Update ONLY isActive field
  food.isActive = isActive;
  await food.save();

  return food;
};

export const FoodServices = {
  createFoodService,
  getOwnerFoodsService,
  updateFoodService,
  deleteFoodService,
  getFoodsService,
  getStaffFoodsService,
  staffUpdateFoodAvailabilityService,
};
