'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Bell,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSearch,
  Youtube,
  Radio,
  ExternalLink,
} from 'lucide-react'
import type { Bill } from '@/types/supabase'

interface DashboardContentProps {
  recentBills: Bill[]
  alertsCount: number
  billsByStatus: Record<string, number>
  isLoggedIn: boolean
}

interface YouTubeLiveData {
  isLive: boolean
  videoId: string | null
  title: string | null
  channelUrl: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  co_creation: { label: 'Współtworzenie', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', icon: FileText },
  preconsultation: { label: 'Prekonsultacje', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200', icon: FileText },
  consultation: { label: 'Konsultacje', color: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200', icon: FileText },
  draft: { label: 'Projekt', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: FileText },
  submitted: { label: 'Złożony', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: FileSearch },
  first_reading: { label: 'I Czytanie', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', icon: FileText },
  committee: { label: 'Komisja', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: AlertCircle },
  second_reading: { label: 'II Czytanie', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: FileText },
  third_reading: { label: 'III Czytanie', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: FileText },
  senate: { label: 'Senat', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', icon: FileText },
  presidential: { label: 'Prezydent', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: FileText },
  published: { label: 'Opublikowana', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
  rejected: { label: 'Odrzucona', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
}

export function DashboardContent({ recentBills, alertsCount, billsByStatus, isLoggedIn }: DashboardContentProps) {
  const totalBills = Object.values(billsByStatus).reduce((a, b) => a + b, 0)
  const activeBills = totalBills - (billsByStatus.published || 0) - (billsByStatus.rejected || 0)

  // YouTube Live state
  const [youtubeLive, setYoutubeLive] = useState<YouTubeLiveData | null>(null)
  
  // Fetch YouTube live status
  useEffect(() => {
    async function fetchYouTubeLive() {
      try {
        const response = await fetch('/api/youtube-live')
        const data = await response.json()
        setYoutubeLive(data)
      } catch (error) {
        console.error('Failed to fetch YouTube live status:', error)
      }
    }
    
    fetchYouTubeLive()
    // Refresh every 2 minutes
    const interval = setInterval(fetchYouTubeLive, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Live Stream Banner */}
      {youtubeLive?.isLive && youtubeLive.videoId && (
        <Card className="border-red-500/50 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Video embed */}
              <div className="lg:w-2/3 aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeLive.videoId}?autoplay=0`}
                  title="Transmisja na żywo - Sejm RP"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              
              {/* Info panel */}
              <div className="lg:w-1/3 p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="animate-pulse">
                    <Radio className="h-3 w-3 mr-1" />
                    NA ŻYWO
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Transmisja z Sejmu RP
                </h3>
                {youtubeLive.title && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {youtubeLive.title}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <Link href={`https://www.youtube.com/watch?v=${youtubeLive.videoId}`} target="_blank">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <Youtube className="h-4 w-4 mr-2" />
                      Oglądaj na YouTube
                    </Button>
                  </Link>
                  <Link href="/calendar">
                    <Button variant="outline" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Zobacz kalendarz
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Witaj w Ścieżce Prawa</h2>
        <p className="text-muted-foreground">
          Śledź proces legislacyjny w Polsce i bądź na bieżąco z najnowszymi ustawami.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie ustawy</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
            <p className="text-xs text-muted-foreground">
              w bazie danych
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne projekty</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBills}</div>
            <p className="text-xs text-muted-foreground">
              w trakcie procedowania
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opublikowane</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billsByStatus.published || 0}</div>
            <p className="text-xs text-muted-foreground">
              ustaw weszło w życie
            </p>
          </CardContent>
        </Card>

        {isLoggedIn ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Twoje powiadomienia</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertsCount}</div>
              <p className="text-xs text-muted-foreground">
                aktywnych alertów
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="opacity-75">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Powiadomienia</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zaloguj się, aby śledzić ustawy
              </p>
              <Button variant="link" size="sm" className="p-0 h-auto mt-1" asChild>
                <Link href="/login">Zaloguj się →</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bills */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ostatnie aktualizacje</CardTitle>
              <CardDescription>
                Najnowsze zmiany w projektach ustaw
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/bills">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recentBills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Brak ustaw do wyświetlenia</p>
                    <p className="text-sm text-muted-foreground">
                      Sprawdź później lub dodaj pierwsze projekty
                    </p>
                  </div>
                ) : (
                  recentBills.map((bill) => {
                    const status = statusConfig[bill.status] || statusConfig.draft
                    const StatusIcon = status.icon
                    return (
                      <Link
                        key={bill.id}
                        href={`/bills/${bill.id}`}
                        className="block"
                      >
                        <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <StatusIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                              <div className="min-w-0">
                                <p className="font-medium truncate" title={bill.title}>{bill.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {bill.sejm_id}{bill.ministry && ` • ${bill.ministry}`}
                                </p>
                              </div>
                              <Badge className={status.color} variant="secondary">
                                {status.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(bill.last_updated), {
                                  addSuffix: true,
                                  locale: pl,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Podział według statusu</CardTitle>
            <CardDescription>
              Rozkład projektów ustaw
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(billsByStatus).map(([status, count]) => {
                const config = statusConfig[status] || statusConfig.draft
                const percentage = totalBills > 0 ? Math.round((count / totalBills) * 100) : 0
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className={config.color} variant="secondary">
                          {config.label}
                        </Badge>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(billsByStatus).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Brak danych do wyświetlenia
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - different for logged in vs not */}
      {isLoggedIn ? (
        <Card>
          <CardHeader>
            <CardTitle>Szybkie akcje</CardTitle>
            <CardDescription>
              Przejdź bezpośrednio do najważniejszych funkcji
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/search">
                  <FileSearch className="h-6 w-6" />
                  <span>Wyszukaj ustawę</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/bills">
                  <FileText className="h-6 w-6" />
                  <span>Przeglądaj ustawy</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/alerts">
                  <Bell className="h-6 w-6" />
                  <span>Zarządzaj alertami</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Zaloguj się, aby odblokować więcej funkcji</CardTitle>
            <CardDescription>
              Po zalogowaniu zyskasz dostęp do wyszukiwarki AI, powiadomień i zapisanych ustaw
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/login">Zaloguj się</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Utwórz konto</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
