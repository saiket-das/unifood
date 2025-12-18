import { z } from "zod";

export const createBranchValidationSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  location: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

const updateBranchValidationSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  location: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

export const BranchValidations = {
  createBranchValidationSchema,
  updateBranchValidationSchema,
};
