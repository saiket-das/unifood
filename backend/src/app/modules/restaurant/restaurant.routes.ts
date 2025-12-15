import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLES } from "../../types/user";
import { RestaurantControllers } from "./restaurant.controllers";
import { RestaurantValidations } from "./restaurant.validation";
import { upload } from "../../middlewares/sendImageToCloudinary";
import AppError from "../../errors/AppError";

const router = Router();

// Add a new resturant
router.post(
  "/",
  auth(USER_ROLES.OWNER),
  upload.single("logo"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data.trim());
      } else {
        req.body = {};
      }
      next();
    } catch (err: any) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid JSON in 'data' field"
      );
    }
  },
  validateRequest(RestaurantValidations.createRestaurantSchema),
  RestaurantControllers.createRestaurant
);

// Get my restaurant
router.get(
  "/me",
  auth(USER_ROLES.OWNER),
  RestaurantControllers.getMyRestaurant
);

// Update restaurant
router.patch(
  "/:id",
  auth(USER_ROLES.OWNER),
  upload.single("logo"),
  validateRequest(RestaurantValidations.updateRestaurantSchema),
  RestaurantControllers.updateRestaurant
);

export const RestaurantRoutes = router;
