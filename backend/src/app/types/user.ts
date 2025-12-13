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
