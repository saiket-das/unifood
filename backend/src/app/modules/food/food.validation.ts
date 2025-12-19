import { z } from "zod";

// Create Food
export const createFoodSchema = z.object({
  restaurantId: z.string("Restaurant ID is required"),
  branchId: z.string().optional(),
  name: z.string().min(2, "Food name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number("Price is required"),
  isActive: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
});

// Update Food
export const updateFoodSchema = z.object({
  branchId: z.string().optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  isActive: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
});

// Staff Update Food - ONLY allows isActive field
export const staffUpdateFoodSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict(); // Reject any additional fields
