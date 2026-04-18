import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { userHasAdminRole } from '@/lib/auth'

export async function getVerifiedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function requireAdminUser(): Promise<User | null> {
  const user = await getVerifiedUser()
  return user && userHasAdminRole(user) ? user : null
}

export async function requireAdminPageUser(): Promise<User> {
  const user = await requireAdminUser()

  if (!user) {
    redirect('/auth/login')
  }

  return user
}