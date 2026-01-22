import { USER_PUBLIC_SELECT } from '../../user/projections/user.projection';

export const TENANT_PUBLIC_SELECT = {
  id: true,
  name: true,
  custom_domain: true,
} as const;

export const TENANT_WITH_USERS_SELECT = {
  ...TENANT_PUBLIC_SELECT,
  users: {
    select: USER_PUBLIC_SELECT,
  },
} as const;

