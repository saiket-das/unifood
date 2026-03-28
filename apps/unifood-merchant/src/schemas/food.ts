import { z } from "zod";

export const variantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unitType: z.enum(["portion", "size", "weight", "volume", "unit"]),
  unitValue: z.string().optional(),
  unitLabel: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  isAvailable: z.boolean(),
});

export const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, "Please select at least one category"),
  availableInAllBranches: z.boolean(),
  branchIds: z.array(z.string()).optional(),
  photo: z.string().optional(),
  isActive: z.boolean(),
  isVeg: z.boolean(),
  isSpicy: z.boolean(),
  preparationTime: z.string().optional(),
  pricingType: z.enum(["fixed", "variants"]),
  fixedPrice: z.string().optional(),
  fixedUnitType: z.enum(["portion", "size", "weight", "volume", "unit"]).optional(),
  fixedUnitValue: z.string().optional(),
  fixedUnitLabel: z.string().optional(),
  variants: z.array(variantSchema).optional(),
});

export type MenuItemValues = z.infer<typeof menuItemSchema>;
export type VariantValues = z.infer<typeof variantSchema>;
