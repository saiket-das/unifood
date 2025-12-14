export const USER_ROLES = {
  STUDENT: "STUDENT",
  OWNER: "OWNER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
} as const;

export type UserRoleProps = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type UserStatusProps = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export enum USER_APPS {
  FOOD_APP = "FOOD_APP",
  OWNER_DASHBOARD = "OWNER_DASHBOARD",
}
