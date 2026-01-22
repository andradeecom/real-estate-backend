export const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  tenant_id: true,
} as const;

export const USER_AUTH_SELECT = {
  ...USER_PUBLIC_SELECT,
  password_hash: true,
} as const;
