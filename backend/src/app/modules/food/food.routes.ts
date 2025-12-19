import { Router, Request, Response, NextFunction } from "express";
import { FoodControllers } from "./food.controllers";
import { createFoodSchema, updateFoodSchema, staffUpdateFoodSchema } from "./food.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../types/user";
import AppError from "../../errors/AppError";
import { upload } from "../../middlewares/sendImageToCloudinary";

const router = Router();

// Create Food with optional image upload
router.post(
  "/",
  auth(USER_ROLES.OWNER),
  upload.single("photo"), // optional image
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data.trim());
      } else {
        req.body = {};
      }
      next();
    } catch (err: any) {
      throw new AppError(400, "Invalid JSON in 'data' field");
    }
  },
  validateRequest(createFoodSchema),
  FoodControllers.createFood
);

// Get Foods
router.get("/", FoodControllers.getFoods);

// GET /api/foods/owner?branchId=...
router.get("/owner", auth(USER_ROLES.OWNER), FoodControllers.getOwnerFoods);

// Update Food
router.patch(
  "/:id",
  auth(USER_ROLES.OWNER),
  upload.single("photo"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data.trim());
      }
      next();
    } catch (err: any) {
      throw new AppError(400, "Invalid JSON in 'data' field");
    }
  },
  validateRequest(updateFoodSchema),
  FoodControllers.updateFood
);

// Delete Food
router.delete("/:id", auth(USER_ROLES.OWNER), FoodControllers.deleteFood);

// Staff routes
// Get foods for staff
router.get(
  "/staff",
  auth(USER_ROLES.STAFF, USER_ROLES.OWNER),
  FoodControllers.getStaffFoods
);

// Update food availability (staff only - granular permission)
router.patch(
  "/:id/availability",
  auth(USER_ROLES.STAFF, USER_ROLES.OWNER),
  validateRequest(staffUpdateFoodSchema),
  FoodControllers.updateFoodAvailability
);

export const FoodRoutes = router;
