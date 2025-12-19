import { z } from "zod";

export const createStaffSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  branchIds: z
    .array(z.string())
    .min(1, "At least one branch must be assigned"),
  permissions: z
    .object({
      canManageOrders: z.boolean().optional(),
      canUpdateFoodAvailability: z.boolean().optional(),
    })
    .optional(),
});

export const updateAssignmentSchema = z.object({
  branchIds: z.array(z.string()).min(1).optional(),
  permissions: z
    .object({
      canManageOrders: z.boolean().optional(),
      canUpdateFoodAvailability: z.boolean().optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export const StaffAssignmentValidation = {
  createStaffSchema,
  updateAssignmentSchema,
};
