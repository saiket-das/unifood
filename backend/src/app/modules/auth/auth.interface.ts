import { UserRoleProps } from "../../types/user";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
export interface LoginPayload {
  email: string;
  password: string;
  app: "FOOD_APP" | "OWNER_DASHBOARD";
}

export interface JwtPayloadCustom {
  userId: string;
  role: UserRoleProps;
}
