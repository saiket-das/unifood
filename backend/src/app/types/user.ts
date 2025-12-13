export const USER_ROLES = {
  STUDENT: "STUDENT",
  OWNER: "OWNER",
  STAFF: "STAFF",
} as const;

export type USER_ROLE = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type USER_STATUS_TYPE = (typeof USER_STATUS)[keyof typeof USER_STATUS];
