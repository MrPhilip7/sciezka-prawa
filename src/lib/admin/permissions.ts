import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/supabase'

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return (profile?.role as UserRole) || 'user'
}

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'admin' || role === 'super_admin'
}

export async function isModerator(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'moderator' || role === 'admin' || role === 'super_admin'
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'super_admin'
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canEditBills(role: UserRole): boolean {
  return role === 'moderator' || role === 'admin' || role === 'super_admin'
}

export function canDeleteBills(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canHideBills(role: UserRole): boolean {
  return role === 'moderator' || role === 'admin' || role === 'super_admin'
}

export function canViewLogs(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canChangeSettings(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canChangeUserRoles(currentRole: UserRole, targetRole: UserRole): boolean {
  // Super admin can change anyone
  if (currentRole === 'super_admin') return true
  
  // Admin can only change users and moderators
  if (currentRole === 'admin') {
    return targetRole === 'user' || targetRole === 'moderator'
  }
  
  return false
}

export const roleLabels: Record<UserRole, string> = {
  user: 'Użytkownik',
  moderator: 'Moderator',
  admin: 'Administrator',
  super_admin: 'Super Admin',
}

export const roleColors: Record<UserRole, string> = {
  user: 'bg-gray-100 text-gray-800',
  moderator: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
  super_admin: 'bg-red-100 text-red-800',
}
