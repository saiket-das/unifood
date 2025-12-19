import { Model } from "mongoose";
import { USER_ROLES, USER_STATUS } from "../../types/user";

export interface UserProps {
  name: string;
  email: string;
  password: string;
  role?: (typeof USER_ROLES)[keyof typeof USER_ROLES];
  status?: (typeof USER_STATUS)[keyof typeof USER_STATUS];
  allowedApps?: [string];
  mustChangePassword?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StaticUserModel extends Model<UserProps> {
  // is user exists
  isUserExists(id: string): Promise<UserProps>;

  // given password & Database password match
  isPasswordMatched(
    plainPassword: string,
    hashPassword: string
  ): Promise<Boolean>;
}
