import type { User } from '@supabase/supabase-js'

export const ADMIN_ROLES = ['owner', 'admin'] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export function getUserRole(user: Pick<User, 'app_metadata'> | null | undefined): string | undefined {
  const role = (user?.app_metadata as { role?: unknown } | undefined)?.role
  return typeof role === 'string' ? role : undefined
}

export function isAdminRole(role: string | undefined | null): role is AdminRole {
  return ADMIN_ROLES.includes((role || '') as AdminRole)
}

export function userHasAdminRole(user: Pick<User, 'app_metadata'> | null | undefined) {
  return isAdminRole(getUserRole(user))
}