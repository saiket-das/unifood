import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RestaurantServices } from "./restaurant.services";

const createRestaurant = catchAsync(async (req: Request, res: Response) => {
  const restaurant = await RestaurantServices.createRestaurantService(
    req.user!,
    req.body,
    req.file
  );

  return sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Restaurant created successfully",
    data: restaurant,
  });
});

const getMyRestaurant = catchAsync(async (req: Request, res: Response) => {
  const result = await RestaurantServices.getMyRestaurantService(req.user!);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Restaurant fetched successfully",
    data: result,
  });
});

const updateRestaurant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await RestaurantServices.updateRestaurantService(
    req.user!,
    id,
    req.body,
    req.file // 👈 optional
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Restaurant updated successfully",
    data: result,
  });
});

export const RestaurantControllers = {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
};
