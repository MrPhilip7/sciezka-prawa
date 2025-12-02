'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Users,
  Search,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Ban,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Profile, UserRole } from '@/types/supabase'

interface UsersManagementContentProps {
  users: Profile[]
  currentUserId: string
  currentUserRole: UserRole
}

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  user: { 
    label: 'Użytkownik', 
    icon: <User className="h-4 w-4" />, 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' 
  },
  moderator: { 
    label: 'Moderator', 
    icon: <Shield className="h-4 w-4" />, 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
  },
  admin: { 
    label: 'Administrator', 
    icon: <ShieldCheck className="h-4 w-4" />, 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
  },
  super_admin: { 
    label: 'Super Admin', 
    icon: <ShieldAlert className="h-4 w-4" />, 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
  },
}

export function UsersManagementContent({ users, currentUserId, currentUserRole }: UsersManagementContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    userId: string
    action: 'ban' | 'unban' | 'role'
    newRole?: UserRole
    userName?: string
  }>({ open: false, userId: '', action: 'ban' })

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setIsLoading(userId)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { role: newRole } }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      toast.success('Rola użytkownika została zmieniona')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wystąpił błąd')
    } finally {
      setIsLoading(null)
      setConfirmDialog({ open: false, userId: '', action: 'role' })
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setIsLoading(userId)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { is_active: isActive } }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      toast.success(isActive ? 'Użytkownik został odblokowany' : 'Użytkownik został zablokowany')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wystąpił błąd')
    } finally {
      setIsLoading(null)
      setConfirmDialog({ open: false, userId: '', action: 'ban' })
    }
  }

  const canChangeRole = (targetRole: UserRole) => {
    if (currentUserRole === 'super_admin') return true
    if (currentUserRole === 'admin') {
      return targetRole !== 'super_admin' && targetRole !== 'admin'
    }
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Zarządzanie użytkownikami
          </h2>
          <p className="text-muted-foreground">
            Przeglądaj i zarządzaj kontami użytkowników
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po email lub nazwie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Użytkownicy ({filteredUsers.length})</CardTitle>
          <CardDescription>Lista wszystkich zarejestrowanych użytkowników</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Użytkownik</TableHead>
                <TableHead>Rola</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data rejestracji</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const role = roleConfig[user.role] || roleConfig.user
                const isCurrentUser = user.id === currentUserId
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || 'Brak nazwy'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${role.color}`}>
                        {role.icon}
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="outline" className="gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Aktywny
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="h-3 w-3" />
                          Zablokowany
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'd MMM yyyy', { locale: pl })}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isLoading === user.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Zmień rolę</DropdownMenuLabel>
                            {(['user', 'moderator', 'admin', 'super_admin'] as UserRole[]).map((newRole) => (
                              <DropdownMenuItem
                                key={newRole}
                                disabled={!canChangeRole(user.role) || user.role === newRole}
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  userId: user.id,
                                  action: 'role',
                                  newRole,
                                  userName: user.email || user.full_name || 'użytkownik',
                                })}
                              >
                                {roleConfig[newRole].icon}
                                <span className="ml-2">{roleConfig[newRole].label}</span>
                                {user.role === newRole && ' (obecna)'}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={user.is_active ? 'text-red-600' : 'text-green-600'}
                              disabled={user.role === 'super_admin'}
                              onClick={() => setConfirmDialog({
                                open: true,
                                userId: user.id,
                                action: user.is_active ? 'ban' : 'unban',
                                userName: user.email || user.full_name || 'użytkownik',
                              })}
                            >
                              {user.is_active ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Zablokuj
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Odblokuj
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {isCurrentUser && (
                        <span className="text-sm text-muted-foreground">To Ty</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'ban' && 'Zablokować użytkownika?'}
              {confirmDialog.action === 'unban' && 'Odblokować użytkownika?'}
              {confirmDialog.action === 'role' && 'Zmienić rolę użytkownika?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'ban' && (
                <>Użytkownik <strong>{confirmDialog.userName}</strong> nie będzie mógł się zalogować.</>
              )}
              {confirmDialog.action === 'unban' && (
                <>Użytkownik <strong>{confirmDialog.userName}</strong> będzie mógł ponownie się zalogować.</>
              )}
              {confirmDialog.action === 'role' && confirmDialog.newRole && (
                <>
                  Czy na pewno chcesz zmienić rolę użytkownika <strong>{confirmDialog.userName}</strong> na{' '}
                  <strong>{roleConfig[confirmDialog.newRole].label}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.action === 'role' && confirmDialog.newRole) {
                  handleRoleChange(confirmDialog.userId, confirmDialog.newRole)
                } else {
                  handleToggleActive(confirmDialog.userId, confirmDialog.action === 'unban')
                }
              }}
            >
              Potwierdź
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
