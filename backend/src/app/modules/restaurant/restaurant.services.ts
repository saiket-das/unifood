import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { RestaurantModel } from "./restaurant.model";
import { RestaurantProps } from "./restaurant.interface";
import { JwtPayload } from "jsonwebtoken";
import { sendImageToCloudinary } from "../../middlewares/sendImageToCloudinary";

export const createRestaurantService = async (
  user: JwtPayload,
  payload: Partial<RestaurantProps>,
  file?: Express.Multer.File
) => {
  // Check if owner already has a restaurant
  const exists = await RestaurantModel.findOne({ ownerId: user.userId });
  if (exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Restaurant already exists for this owner"
    );
  }

  // Upload logo if file exists
  let logoUrl: string | undefined;
  if (file) {
    const imageName = `restaurant-${user.userId}`;

    try {
      const uploadResult = await sendImageToCloudinary(file.path, imageName);

      logoUrl = uploadResult.secure_url as string;
    } catch (err) {
      throw new AppError(500, "Failed to upload restaurant logo");
    }
  }

  // Create restaurant
  const restaurant = await RestaurantModel.create({
    ownerId: user.userId,
    name: payload.name!,
    description: payload.description!,
    logo: logoUrl,
  });

  return restaurant;
};

const getMyRestaurantService = async (user: JwtPayload) => {
  const restaurant = await RestaurantModel.findOne({
    ownerId: user.userId,
  });

  if (!restaurant) {
    throw new AppError(httpStatus.NOT_FOUND, "Restaurant not found");
  }

  return restaurant;
};

const updateRestaurantService = async (
  user: JwtPayload,
  restaurantId: string,
  payload: Partial<RestaurantProps>,
  file?: Express.Multer.File
) => {
  // Upload logo if file exists
  let logoUrl: string | undefined;
  if (file) {
    const imageName = `restaurant-${user.userId}`;

    try {
      const uploadResult = await sendImageToCloudinary(file.path, imageName);

      logoUrl = uploadResult.secure_url as string;
    } catch (err) {
      throw new AppError(500, "Failed to upload restaurant logo");
    }
  }

  const updated = await RestaurantModel.findByIdAndUpdate(
    restaurantId,
    {
      ...payload,
      ...(logoUrl && { logo: logoUrl }),
    },
    { new: true }
  );

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, "Restaurant not found");
  }

  return updated;
};

export const RestaurantServices = {
  createRestaurantService,
  getMyRestaurantService,
  updateRestaurantService,
};
