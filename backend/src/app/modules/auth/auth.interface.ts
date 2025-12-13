import { UserRoleProps } from "../../types/user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayloadCustom {
  userId: string;
  role: UserRoleProps;
}
