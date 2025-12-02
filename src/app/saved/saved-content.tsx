'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  Bookmark,
  Clock,
  FileText,
  Search,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Bill, UserAlert, SavedSearch } from '@/types/supabase'

interface AlertWithBill extends UserAlert {
  bills: Bill
}

interface SavedContentProps {
  savedSearches: SavedSearch[]
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

export function SavedContent({ savedSearches: initialSearches, alerts: initialAlerts }: SavedContentProps) {
  const router = useRouter()
  const [savedSearches, setSavedSearches] = useState(initialSearches)
  const [alerts, setAlerts] = useState(initialAlerts)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = (id: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: loading }))
  }

  const deleteSearch = async (searchId: string) => {
    setLoading(searchId, true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)

      if (error) throw error

      setSavedSearches(prev => prev.filter(s => s.id !== searchId))
      toast.success('Wyszukiwanie zostało usunięte')
    } catch (error) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setLoading(searchId, false)
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

  const runSearch = (search: SavedSearch) => {
    const params = new URLSearchParams()
    if (search.query) {
      params.set('q', search.query)
    }
    if (search.filters && typeof search.filters === 'object') {
      const filters = search.filters as Record<string, string>
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
    }
    router.push(`/bills?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Zapisane</h2>
        <p className="text-muted-foreground">
          Twoje zapisane wyszukiwania i śledzone ustawy
        </p>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Śledzone ustawy ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="searches" className="gap-2">
            <Search className="h-4 w-4" />
            Zapisane wyszukiwania ({savedSearches.length})
          </TabsTrigger>
        </TabsList>

        {/* Tracked Bills Tab */}
        <TabsContent value="alerts">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nie śledzisz jeszcze żadnych ustaw</p>
                <p className="text-muted-foreground text-center mt-2">
                  Przejdź do listy ustaw i dodaj alerty dla projektów, które chcesz śledzić
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/bills">Przeglądaj ustawy</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {alerts.map((alert) => {
                const bill = alert.bills
                const status = statusConfig[bill.status] || statusConfig.draft

                return (
                  <Card key={alert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={status.color} variant="secondary">
                              {status.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {bill.sejm_id}
                            </Badge>
                          </div>
                          <Link href={`/bills/${bill.id}`}>
                            <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                              {bill.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Dodano{' '}
                            {formatDistanceToNow(new Date(alert.created_at), {
                              addSuffix: true,
                              locale: pl,
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/bills/${bill.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteAlert(alert.id)}
                            disabled={loadingStates[alert.id]}
                          >
                            {loadingStates[alert.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="searches">
          {savedSearches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Brak zapisanych wyszukiwań</p>
                <p className="text-muted-foreground text-center mt-2">
                  Zapisz swoje wyszukiwania, aby szybko do nich wracać
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/bills">Wyszukaj ustawy</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <Card key={search.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{search.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          Szukaj: "{search.query}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(search.created_at), {
                            addSuffix: true,
                            locale: pl,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runSearch(search)}
                        >
                          Uruchom
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteSearch(search.id)}
                          disabled={loadingStates[search.id]}
                        >
                          {loadingStates[search.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
