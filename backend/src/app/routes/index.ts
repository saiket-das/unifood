import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";

const router = Router();

const moduleRoute = [
  {
    path: "/users",
    route: UserRoutes,
  },
];

moduleRoute.forEach((route) => router.use(route.path, route.route));

export default router;
