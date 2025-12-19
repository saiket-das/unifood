import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { RestaurantRoutes } from "../modules/restaurant/restaurant.routes";
import { BranchRoutes } from "../modules/branch/branch.routes";
import { FoodRoutes } from "../modules/food/food.routes";
import { StaffAssignmentRoutes } from "../modules/staffAssignment/staffAssignment.routes";

const router = Router();

const moduleRoute = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/restaurants",
    route: RestaurantRoutes,
  },
  {
    path: "/branches",
    route: BranchRoutes,
  },
  {
    path: "/foods",
    route: FoodRoutes,
  },
  {
    path: "/staff-assignments",
    route: StaffAssignmentRoutes,
  },
];

moduleRoute.forEach((route) => router.use(route.path, route.route));

export default router;
