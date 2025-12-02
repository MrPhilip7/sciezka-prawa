'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Bell,
  BellOff,
  Clock,
  FileText,
  Mail,
  Settings2,
  Trash2,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Bill, UserAlert } from '@/types/supabase'

interface AlertWithBill extends UserAlert {
  bills: Bill
}

interface AlertsContentProps {
  alerts: AlertWithBill[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Projekt', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  submitted: { label: 'Złożony', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  first_reading: { label: 'I Czytanie', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  committee: { label: 'Komisja', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  second_reading: { label: 'II Czytanie', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  third_reading: { label: 'III Czytanie', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  senate: { label: 'Senat', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
  presidential: { label: 'Prezydent', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  published: { label: 'Opublikowana', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected: { label: 'Odrzucona', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
}

export function AlertsContent({ alerts: initialAlerts }: AlertsContentProps) {
  const router = useRouter()
  const [alerts, setAlerts] = useState(initialAlerts)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = (id: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: loading }))
  }

  const toggleAlert = async (alertId: string, currentActive: boolean) => {
    setLoading(alertId, true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({ is_active: !currentActive })
        .eq('id', alertId)

      if (error) throw error

      setAlerts(prev =>
        prev.map(a =>
          a.id === alertId ? { ...a, is_active: !currentActive } : a
        )
      )
      toast.success(currentActive ? 'Alert wyłączony' : 'Alert włączony')
    } catch (error) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(alertId, false)
    }
  }


  const toggleEmailNotification = async (alertId: string, currentValue: boolean) => {
    setLoading(`email-${alertId}`, true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({ notify_email: !currentValue })
        .eq('id', alertId)

      if (error) throw error

      setAlerts(prev =>
        prev.map(a =>
          a.id === alertId ? { ...a, notify_email: !currentValue } : a
        )
      )
      toast.success('Ustawienia zapisane')
    } catch (error) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(`email-${alertId}`, false)
    }
  }

  const deleteAlert = async (alertId: string) => {
    setLoading(alertId, true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', alertId)

      if (error) throw error

      setAlerts(prev => prev.filter(a => a.id !== alertId))
      toast.success('Alert został usunięty')
    } catch (error) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(alertId, false)
    }
  }

  const activeAlerts = alerts.filter(a => a.is_active)
  const inactiveAlerts = alerts.filter(a => !a.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Powiadomienia</h2>
          <p className="text-muted-foreground">
            Zarządzaj alertami o zmianach w śledzonych ustawach
          </p>
        </div>
        <Button asChild>
          <Link href="/bills">
            <Bell className="h-4 w-4 mr-2" />
            Dodaj nowy alert
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie alerty</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne</CardTitle>
            <Bell className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wstrzymane</CardTitle>
            <BellOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveAlerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nie masz jeszcze żadnych alertów</p>
            <p className="text-muted-foreground text-center mt-2">
              Przejdź do listy ustaw i dodaj alerty dla projektów, które chcesz śledzić
            </p>
            <Button className="mt-4" asChild>
              <Link href="/bills">Przeglądaj ustawy</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const bill = alert.bills
            const status = statusConfig[bill.status] || statusConfig.draft
            const isLoading = loadingStates[alert.id]

            return (
              <Card key={alert.id} className={!alert.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {alert.is_active ? (
                          <Bell className="h-4 w-4 text-green-500" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge className={status.color} variant="secondary">
                          {status.label}
                        </Badge>
                        <Badge variant="outline">{bill.sejm_id}</Badge>
                      </div>

                      <Link href={`/bills/${bill.id}`}>
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
                          {bill.title}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {bill.ministry && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {bill.ministry}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Dodano{' '}
                          {formatDistanceToNow(new Date(alert.created_at), {
                            addSuffix: true,
                            locale: pl,
                          })}
                        </span>
                        {alert.notify_email && (
                          <span className="flex items-center gap-1 text-primary">
                            <Mail className="h-4 w-4" />
                            Email
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle Active */}
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`active-${alert.id}`}
                          checked={alert.is_active}
                          onCheckedChange={() => toggleAlert(alert.id, alert.is_active)}
                          disabled={isLoading}
                        />
                        <Label htmlFor={`active-${alert.id}`} className="text-sm">
                          {alert.is_active ? 'Aktywny' : 'Wyłączony'}
                        </Label>
                      </div>

                      {/* Settings Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ustawienia alertu</DialogTitle>
                            <DialogDescription>
                              Skonfiguruj sposób powiadamiania dla tej ustawy
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label>Powiadomienia email</Label>
                                <p className="text-sm text-muted-foreground">
                                  Otrzymuj powiadomienia o zmianach na email
                                </p>
                              </div>
                              <Switch
                                checked={alert.notify_email}
                                onCheckedChange={() => toggleEmailNotification(alert.id, alert.notify_email)}
                                disabled={loadingStates[`email-${alert.id}`]}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {}}>
                              Zamknij
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Delete */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Usuń alert</DialogTitle>
                            <DialogDescription>
                              Czy na pewno chcesz usunąć ten alert? Ta akcja jest nieodwracalna.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Anuluj</Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteAlert(alert.id)}
                              disabled={isLoading}
                            >
                              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Usuń
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
