import { USER_ROLE } from "@app/types/user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayloadCustom {
  userId: string;
  role: USER_ROLE;
}
