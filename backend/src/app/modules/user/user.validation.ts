import { z } from "zod";
import { USER_ROLES } from "../../types/user";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z
    .enum([USER_ROLES.STUDENT, USER_ROLES.OWNER, USER_ROLES.STAFF])
    .optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z
    .enum([USER_ROLES.STUDENT, USER_ROLES.OWNER, USER_ROLES.STAFF])
    .optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
