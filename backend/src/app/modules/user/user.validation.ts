import { z } from "zod";
import { USER_STATUS } from "../../types/user";

// Register User (Student / Owner)

const registerUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be less than 50 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100),
});

// Update User (Admin / Owner / Profile)
const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  status: z
    .enum(Object.values(USER_STATUS) as [string, ...string[]])
    .optional(),
});

export const UserValidations = {
  registerUserSchema,
  updateUserSchema,
};
