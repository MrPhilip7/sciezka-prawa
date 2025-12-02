'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  FileText,
  EyeOff,
  Settings,
  RefreshCw,
  Activity,
  Shield,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { UserRole } from '@/types/supabase'

interface AdminDashboardContentProps {
  stats: {
    totalUsers: number
    totalBills: number
    hiddenBills: number
  }
  recentLogs: Array<{
    id: string
    action: string
    target_type: string
    target_id: string | null
    created_at: string
    profiles: { email: string | null; full_name: string | null } | null
  }>
  userRole: UserRole
}

const actionLabels: Record<string, string> = {
  update_user: 'Aktualizacja użytkownika',
  update_setting: 'Zmiana ustawień',
  edit_bill: 'Edycja ustawy',
  delete_bill: 'Usunięcie ustawy',
  hide: 'Ukrycie ustawy',
  unhide: 'Odkrycie ustawy',
  sync: 'Synchronizacja',
}

const targetTypeLabels: Record<string, string> = {
  user: 'Użytkownik',
  bill: 'Ustawa',
  setting: 'Ustawienie',
}

export function AdminDashboardContent({ stats, recentLogs, userRole }: AdminDashboardContentProps) {
  const isAdmin = userRole === 'admin' || userRole === 'super_admin'
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Panel Administracyjny
          </h2>
          <p className="text-muted-foreground">
            Zarządzaj użytkownikami, ustawami i ustawieniami systemu
          </p>
        </div>
        <Badge 
          variant="secondary" 
          className={
            userRole === 'super_admin' 
              ? 'bg-red-100 text-red-800' 
              : userRole === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
          }
        >
          {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Administrator' : 'Moderator'}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Użytkownicy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Zarejestrowani użytkownicy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ustawy</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBills}</div>
            <p className="text-xs text-muted-foreground">Wszystkie projekty ustaw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukryte</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hiddenBills}</div>
            <p className="text-xs text-muted-foreground">Ukryte ustawy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">System działa poprawnie</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <Link href="/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Użytkownicy</h3>
                  <p className="text-sm text-muted-foreground">Zarządzaj kontami</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/admin/bills">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Ustawy</h3>
                <p className="text-sm text-muted-foreground">Edytuj i ukrywaj</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/sync">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <RefreshCw className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Synchronizacja</h3>
                <p className="text-sm text-muted-foreground">Pobierz dane z Sejmu</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        {isAdmin && (
          <Link href="/admin/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Ustawienia</h3>
                  <p className="text-sm text-muted-foreground">Konfiguracja systemu</p>
              </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Recent Activity */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ostatnia aktywność
                </CardTitle>
                <CardDescription>Dziennik działań administratorów</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/logs">Zobacz wszystkie</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Brak aktywności do wyświetlenia
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50"
                    >
                      <div className="p-2 rounded-full bg-muted">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {actionLabels[log.action] || log.action}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.profiles?.email || 'Unknown'} • {targetTypeLabels[log.target_type] || log.target_type}
                          {log.target_id && ` #${log.target_id.slice(0, 8)}`}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: pl,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
