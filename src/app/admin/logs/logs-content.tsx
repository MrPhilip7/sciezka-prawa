'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Settings,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { Json } from '@/types/supabase'

interface LogsContentProps {
  logs: Array<{
    id: string
    admin_id: string
    action: string
    target_type: string
    target_id: string | null
    details: Json | null
    created_at: string
    profiles: { email: string | null; full_name: string | null } | null
  }>
  totalCount: number
  currentPage: number
  filters: {
    action: string
    targetType: string
  }
}

const actionConfig: Record<string, { label: string; color: string }> = {
  update_user: { label: 'Aktualizacja użytkownika', color: 'bg-blue-100 text-blue-800' },
  update_setting: { label: 'Zmiana ustawień', color: 'bg-orange-100 text-orange-800' },
  edit_bill: { label: 'Edycja ustawy', color: 'bg-purple-100 text-purple-800' },
  delete_bill: { label: 'Usunięcie ustawy', color: 'bg-red-100 text-red-800' },
  hide: { label: 'Ukrycie ustawy', color: 'bg-yellow-100 text-yellow-800' },
  unhide: { label: 'Odkrycie ustawy', color: 'bg-green-100 text-green-800' },
  sync: { label: 'Synchronizacja', color: 'bg-cyan-100 text-cyan-800' },
}

const targetTypeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  user: { label: 'Użytkownik', icon: <User className="h-4 w-4" /> },
  bill: { label: 'Ustawa', icon: <FileText className="h-4 w-4" /> },
  setting: { label: 'Ustawienie', icon: <Settings className="h-4 w-4" /> },
  system: { label: 'System', icon: <RefreshCw className="h-4 w-4" /> },
}

export function LogsContent({ logs, totalCount, currentPage, filters }: LogsContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const limit = 50
  const totalPages = Math.ceil(totalCount / limit)

  const updateFilters = (updates: Partial<typeof filters & { page?: string }>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key === 'targetType' ? 'target_type' : key, value)
      } else {
        params.delete(key === 'targetType' ? 'target_type' : key)
      }
    })
    
    if (!updates.hasOwnProperty('page')) {
      params.delete('page')
    }
    
    router.push(`/admin/logs?${params.toString()}`)
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
            <Activity className="h-6 w-6" />
            Dziennik aktywności
          </h2>
          <p className="text-muted-foreground">
            Historia wszystkich działań administratorów
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.action}
              onValueChange={(value) => updateFilters({ action: value })}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Typ akcji" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie akcje</SelectItem>
                {Object.entries(actionConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.targetType}
              onValueChange={(value) => updateFilters({ targetType: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Typ obiektu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie typy</SelectItem>
                {Object.entries(targetTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logi ({totalCount})</CardTitle>
          <CardDescription>Wszystkie operacje wykonane przez administratorów</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data i czas</TableHead>
                <TableHead>Administrator</TableHead>
                <TableHead>Akcja</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>ID obiektu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Brak logów do wyświetlenia
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const action = actionConfig[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-800' }
                  const targetType = targetTypeConfig[log.target_type] || { label: log.target_type, icon: <Activity className="h-4 w-4" /> }
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), 'd MMM yyyy, HH:mm:ss', { locale: pl })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.profiles?.full_name || 'Brak nazwy'}</p>
                          <p className="text-sm text-muted-foreground">{log.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={action.color}>{action.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {targetType.icon}
                          <span>{targetType.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.target_id ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.target_id.slice(0, 8)}...
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => updateFilters({ page: String(currentPage - 1) })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Strona {currentPage} z {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => updateFilters({ page: String(currentPage + 1) })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
