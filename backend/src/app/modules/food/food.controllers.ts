import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FoodServices } from "./food.services";

// Create Food
const createFood = catchAsync(async (req: Request, res: Response) => {
  const food = await FoodServices.createFoodService(req.body, req.file);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Food created successfully",
    data: food,
  });
});

// Get all foods
const getFoods = catchAsync(async (req: Request, res: Response) => {
  const { restaurantId, branchId } = req.query;
  const foods = await FoodServices.getFoodsService(
    restaurantId as string,
    branchId as string
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Foods fetched successfully",
    data: foods,
  });
});

// Get food by restaurant or branch
const getOwnerFoods = catchAsync(async (req: Request, res: Response) => {
  const ownerId = req.user!.userId;
  const { branchId } = req.query;

  const foods = await FoodServices.getOwnerFoodsService(
    ownerId,
    branchId as string
  );

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Foods fetched successfully",
    data: foods,
  });
});

// Update Food
const updateFood = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const food = await FoodServices.updateFoodService(id, req.body, req.file);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Food updated successfully",
    data: food,
  });
});

const deleteFood = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await FoodServices.deleteFoodService(id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Food deleted successfully",
    data: [],
  });
});

// Get foods for staff
const getStaffFoods = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.user!.userId;
  const { branchId } = req.query;

  if (!branchId) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: "Branch ID is required",
      data: [],
    });
  }

  const foods = await FoodServices.getStaffFoodsService(
    staffId,
    branchId as string
  );

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Foods fetched successfully",
    data: foods,
  });
});

// Update food availability (staff only)
const updateFoodAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const staffId = req.user!.userId;

    const food = await FoodServices.staffUpdateFoodAvailabilityService(
      id,
      staffId,
      isActive
    );

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Food availability updated successfully",
      data: food,
    });
  }
);

export const FoodControllers = {
  createFood,
  getOwnerFoods,
  updateFood,
  deleteFood,
  getFoods,
  getStaffFoods,
  updateFoodAvailability,
};
