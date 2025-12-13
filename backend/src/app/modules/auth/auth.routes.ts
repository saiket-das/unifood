import express from "express";
import { AuthControllers } from "./auth.controllers";

const router = express.Router();

// Student registration
router.post("/register/student", AuthControllers.registerStudent);

// Restaurant owner registration
router.post("/register/owner", AuthControllers.registerOwner);

// Login
router.post("/login", AuthControllers.login);

export const AuthRoutes = router;
