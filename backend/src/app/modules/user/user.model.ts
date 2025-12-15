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
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },

    allowedApps: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  const user = this as UserProps & { password: string };

  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

// Send user empty password after hasshing
userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

userSchema.statics.isUserExists = async function (id: string) {
  return await UserModel.findById(id).select("+password");
};

userSchema.statics.isPasswordMatched = async function (
  plainPassword: string,
  hashPassword
) {
  return await bcrypt.compare(plainPassword, hashPassword);
};

export const UserModel = model<UserProps, StaticUserModel>("User", userSchema);
