import { USER_ROLES, USER_STATUS } from "./user.constants";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role?: (typeof USER_ROLES)[keyof typeof USER_ROLES];
  status?: (typeof USER_STATUS)[keyof typeof USER_STATUS];
  createdAt?: Date;
  updatedAt?: Date;
}
