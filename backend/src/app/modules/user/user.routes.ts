import { Router } from "express";
import { UserControllers } from "./user.controllers";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../types/user";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";

const router = Router();

// Student registration
router.post(
  "/register-student",
  validateRequest(UserValidations.registerUserSchema),
  UserControllers.registerStudent
);

// Owner registration
router.post(
  "/register-owner",
  validateRequest(UserValidations.registerUserSchema),
  UserControllers.registerOwner
);

// Others
router.get(
  "/me",
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.OWNER,
    USER_ROLES.STAFF,
    USER_ROLES.STUDENT
  ),
  UserControllers.getMe
);

router.patch(
  "/status/:id",
  auth(USER_ROLES.ADMIN),
  UserControllers.changeStatus
);
router.get("/", auth(USER_ROLES.ADMIN), UserControllers.getAllUsers);

// Delete a user (student, owner, staff)
router.delete(
  "/:id",
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.OWNER,
    USER_ROLES.STAFF,
    USER_ROLES.STUDENT
  ),
  UserControllers.deleteUser
);

export const UserRoutes = router;
