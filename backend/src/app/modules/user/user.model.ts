import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { StaticUserModel, UserProps } from "./user.interface";
import { USER_ROLES, USER_STATUS } from "../../types/user";

const userSchema = new Schema<UserProps>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STUDENT,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

userSchema.statics.isUserExists = async function (id: string) {
  return await UserModel.findOne({ id }).select("+password");
};

userSchema.statics.isPasswordMatched = async function (
  plainPassword: string,
  hashPassword
) {
  return await bcrypt.compare(plainPassword, hashPassword);
};

export const UserModel = model<UserProps, StaticUserModel>("User", userSchema);
