import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { BranchServices } from "./branch.services";
import sendResponse from "../../utils/sendResponse";

const createBranch = catchAsync(async (req: Request, res: Response) => {
  const branch = await BranchServices.createBranchService(req.user!, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Branch created successfully",
    data: branch,
  });
});

const getBranchesByRestaurant = catchAsync(
  async (req: Request, res: Response) => {
    const branches = await BranchServices.getBranchesByRestaurantService(
      req.params.restaurantId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Get all branches successfully",
      data: branches,
    });
  }
);

const updateBranch = catchAsync(async (req: Request, res: Response) => {
  const branch = await BranchServices.updateBranchService(
    req.params.branchId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Branch updated successfully",
    data: branch,
  });
});

export const BranchControllers = {
  createBranch,
  getBranchesByRestaurant,
  updateBranch,
};
