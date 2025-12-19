import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../types/user";
import validateRequest from "../../middlewares/validateRequest";
import { StaffAssignmentValidation } from "./staffAssignment.validation";
import { StaffAssignmentControllers } from "./staffAssignment.controllers";

const router = Router();

// Create staff (owner only)
router.post(
  "/create-staff",
  auth(USER_ROLES.OWNER),
  validateRequest(StaffAssignmentValidation.createStaffSchema),
  StaffAssignmentControllers.createStaff
);

// Get all staff assignments (owner only)
router.get(
  "/",
  auth(USER_ROLES.OWNER),
  StaffAssignmentControllers.getStaffAssignments
);

// Update staff assignment (owner only)
router.patch(
  "/:id",
  auth(USER_ROLES.OWNER),
  validateRequest(StaffAssignmentValidation.updateAssignmentSchema),
  StaffAssignmentControllers.updateAssignment
);

// Deactivate staff (owner only)
router.delete(
  "/:id",
  auth(USER_ROLES.OWNER),
  StaffAssignmentControllers.deactivateStaff
);

// Reset staff password (owner only)
router.post(
  "/:id/reset-password",
  auth(USER_ROLES.OWNER),
  StaffAssignmentControllers.resetStaffPassword
);

export const StaffAssignmentRoutes = router;
