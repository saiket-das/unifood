import express from "express";
import { AuthControllers } from "./auth.controllers";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../types/user";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

// Login
router.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  AuthControllers.login
);

// Change password (all authenticated users)
router.post(
  "/change-password",
  auth(USER_ROLES.STUDENT, USER_ROLES.OWNER, USER_ROLES.STAFF, USER_ROLES.ADMIN),
  validateRequest(AuthValidation.changePasswordSchema),
  AuthControllers.changePassword
);

export const AuthRoutes = router;
