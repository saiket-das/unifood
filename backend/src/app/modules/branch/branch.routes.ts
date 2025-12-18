import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../types/user";
import validateRequest from "../../middlewares/validateRequest";
import { BranchControllers } from "./branch.controllers";
import { BranchValidations } from "./branch.validation";

const router = Router();

// Create branch (Owner only)
router.post(
  "/",
  auth(USER_ROLES.OWNER),
  validateRequest(BranchValidations.createBranchValidationSchema),
  BranchControllers.createBranch
);

// Get all branches of a restaurant
router.get(
  "/restaurant/:restaurantId",
  BranchControllers.getBranchesByRestaurant
);

// Update branch
router.patch(
  "/:branchId",
  auth(USER_ROLES.OWNER),
  validateRequest(BranchValidations.updateBranchValidationSchema),
  BranchControllers.updateBranch
);

export const BranchRoutes = router;
