import { Router } from "express";
import { UserControllers } from "./user.controllers";
import authMiddleware from "../../middlewares/auth";
import { USER_ROLES } from "../../types/user";

// import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

// Protected routes
router.get(
  "/me",
  authMiddleware(
    USER_ROLES.ADMIN,
    USER_ROLES.OWNER,
    USER_ROLES.STAFF,
    USER_ROLES.STUDENT
  ),
  UserControllers.getMe
);
router.patch(
  "/status/:id",
  authMiddleware(USER_ROLES.ADMIN),
  UserControllers.changeStatus
);
router.get("/", authMiddleware(USER_ROLES.ADMIN), UserControllers.getAllUsers);
router.delete("/:id", UserControllers.deleteUser);

export const UserRoutes = router;
