import { Router } from "express";
import { UserControllers } from "./user.controllers";
// import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

// Public routes
router.post("/", UserControllers.createUser);

// Protected routes
// router.use(authMiddleware);

router.get("/me", UserControllers.getMe);
router.patch("/status/:id", UserControllers.changeStatus);
router.get("/", UserControllers.getAllUsers);
router.delete("/:id", UserControllers.deleteUser);

export const UserRoutes = router;
