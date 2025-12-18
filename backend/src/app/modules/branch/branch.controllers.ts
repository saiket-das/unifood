import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { BranchServices } from "./branch.services";

const createBranch = catchAsync(async (req: Request, res: Response) => {
  const branch = await BranchServices.createBranchService(req.user!, req.body);

  res.status(201).json({
    success: true,
    message: "Branch created successfully",
    data: branch,
  });
});

const getBranchesByRestaurant = catchAsync(
  async (req: Request, res: Response) => {
    const branches = await BranchServices.getBranchesByRestaurantService(
      req.params.restaurantId
    );

    res.status(200).json({
      success: true,
      data: branches,
    });
  }
);

const updateBranch = catchAsync(async (req: Request, res: Response) => {
  const branch = await BranchServices.updateBranchService(
    req.params.branchId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Branch updated successfully",
    data: branch,
  });
});

export const BranchControllers = {
  createBranch,
  getBranchesByRestaurant,
  updateBranch,
};
