'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  FileText,
  Clock,
  Bell,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  Calendar,
  Sparkles,
  Settings,
  HelpCircle,
  Bookmark,
  Filter,
  X,
} from 'lucide-react'

// Simplified bill type for landing page demo
interface DemoBill {
  id: string
  sejm_id: string
  title: string
  status: string
  submission_date: string | null
  last_updated: string
  description: string | null
  ministry: string | null
}

interface LandingBillsDemoProps {
  bills: DemoBill[]
  billsByStatus: Record<string, number>
}

const statusConfig: Record<string, { label: string; color: string; barColor: string }> = {
  draft: { label: 'Projekt', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', barColor: 'bg-gray-500' },
  submitted: { label: 'Złożony', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', barColor: 'bg-blue-500' },
  first_reading: { label: 'I Czytanie', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', barColor: 'bg-indigo-500' },
  committee: { label: 'Komisja', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', barColor: 'bg-purple-500' },
  second_reading: { label: 'II Czytanie', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', barColor: 'bg-amber-500' },
  third_reading: { label: 'III Czytanie', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', barColor: 'bg-orange-500' },
  senate: { label: 'Senat', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', barColor: 'bg-cyan-500' },
  presidential: { label: 'Prezydent', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', barColor: 'bg-emerald-500' },
  published: { label: 'Opublikowana', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', barColor: 'bg-green-500' },
  rejected: { label: 'Odrzucona', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', barColor: 'bg-red-500' },
}

// Sort order for statuses in the chart
const statusOrder = ['published', 'first_reading', 'rejected', 'submitted', 'committee', 'second_reading', 'third_reading', 'senate', 'presidential', 'draft']

type ViewType = 'panel' | 'ustawy' | 'kalendarz' | 'wyszukiwarka' | 'powiadomienia' | 'zapisane' | 'ustawienia' | 'pomoc'

export function LandingBillsDemo({ bills, billsByStatus }: LandingBillsDemoProps) {
  const [activeView, setActiveView] = useState<ViewType>('panel')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const totalBills = Object.values(billsByStatus).reduce((a, b) => a + b, 0)
  const activeBillsCount = totalBills - (billsByStatus.published || 0) - (billsByStatus.rejected || 0)
  const publishedCount = billsByStatus.published || 0

  // Sort status entries by order
  const sortedStatuses = Object.entries(billsByStatus)
    .sort(([a], [b]) => statusOrder.indexOf(a) - statusOrder.indexOf(b))
    .slice(0, 6) // Show top 6

  // Filter bills based on search and status
  const filteredBills = bills.filter((bill) => {
    const matchesSearch = !searchQuery || 
      bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.sejm_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || bill.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const navItems = [
    { id: 'panel' as ViewType, label: 'Panel', icon: LayoutDashboard },
    { id: 'ustawy' as ViewType, label: 'Ustawy', icon: FileText },
    { id: 'kalendarz' as ViewType, label: 'Kalendarz', icon: Calendar, badge: 'Nowy', badgeColor: 'bg-primary/20 text-primary' },
    { id: 'wyszukiwarka' as ViewType, label: 'Wyszukiwarka', icon: Sparkles, badge: 'AI', badgeColor: 'bg-blue-500/20 text-blue-500' },
    { id: 'powiadomienia' as ViewType, label: 'Powiadomienia', icon: Bell },
    { id: 'zapisane' as ViewType, label: 'Zapisane', icon: Bookmark },
  ]

  const secondaryNavItems = [
    { id: 'ustawienia' as ViewType, label: 'Ustawienia', icon: Settings },
    { id: 'pomoc' as ViewType, label: 'Pomoc', icon: HelpCircle },
  ]

  const renderContent = () => {
    switch (activeView) {
      case 'panel':
        return (
          <div className="p-6 space-y-6">
            {/* Welcome */}
            <div>
              <h2 className="text-lg font-semibold">Witaj w Ścieżce Prawa</h2>
              <p className="text-sm text-muted-foreground">Śledź proces legislacyjny w Polsce i bądź na bieżąco z najnowszymi ustawami.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                className="rounded-lg border border-border/50 bg-card/50 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setActiveView('ustawy')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Wszystkie ustawy</span>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{totalBills}</p>
                <p className="text-[10px] text-muted-foreground">w bazie danych</p>
              </div>
              <div 
                className="rounded-lg border border-border/50 bg-card/50 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => { setActiveView('ustawy'); setStatusFilter(null); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Aktywne projekty</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{activeBillsCount}</p>
                <p className="text-[10px] text-muted-foreground">w trakcie procedowania</p>
              </div>
              <div 
                className="rounded-lg border border-border/50 bg-card/50 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => { setActiveView('ustawy'); setStatusFilter('published'); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Opublikowane</span>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{publishedCount}</p>
                <p className="text-[10px] text-muted-foreground">ustaw weszło w życie</p>
              </div>
              <div 
                className="rounded-lg border border-border/50 bg-card/50 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setActiveView('powiadomienia')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Twoje powiadomienia</span>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-[10px] text-muted-foreground">aktywnych alertów</p>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Updates */}
              <div className="lg:col-span-2 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <div>
                    <h3 className="text-sm font-semibold">Ostatnie aktualizacje</h3>
                    <p className="text-xs text-muted-foreground">Najnowsze zmiany w projektach ustaw</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs gap-1"
                    onClick={() => setActiveView('ustawy')}
                  >
                    Zobacz wszystkie
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                <div className="divide-y divide-border/50">
                  {bills.slice(0, 4).map((bill) => {
                    const status = statusConfig[bill.status] || statusConfig.draft
                    return (
                      <div 
                        key={bill.id} 
                        className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setActiveView('ustawy')}
                      >
                        <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{bill.title}</p>
                              <p className="text-xs text-muted-foreground">{bill.sejm_id}</p>
                            </div>
                            <Badge className={`${status.color} shrink-0 text-[10px]`} variant="secondary">
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(bill.last_updated), { addSuffix: true, locale: pl })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Status Chart */}
              <div className="rounded-lg border border-border/50 bg-card/50">
                <div className="p-4 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Podział według statusu</h3>
                  <p className="text-xs text-muted-foreground">Rozkład projektów ustaw</p>
                </div>
                <div className="p-4 space-y-3">
                  {sortedStatuses.map(([status, count]) => {
                    const config = statusConfig[status] || statusConfig.draft
                    const percentage = totalBills > 0 ? Math.round((count / totalBills) * 100) : 0
                    return (
                      <div 
                        key={status} 
                        className="space-y-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => { setActiveView('ustawy'); setStatusFilter(status); }}
                      >
                        <div className="flex items-center justify-between">
                          <Badge className={`${config.color} text-[10px]`} variant="secondary">
                            {config.label}
                          </Badge>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full ${config.barColor} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )

      case 'ustawy':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Ustawy</h2>
                <p className="text-sm text-muted-foreground">Przeglądaj i wyszukuj projekty ustaw</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Szukaj po tytule lub numerze..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              {statusFilter && (
                <Badge 
                  className={`${statusConfig[statusFilter]?.color} cursor-pointer gap-1`} 
                  variant="secondary"
                  onClick={() => setStatusFilter(null)}
                >
                  {statusConfig[statusFilter]?.label}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filtry
              </Button>
            </div>

            {/* Bills List */}
            <div className="rounded-lg border border-border/50 bg-card/50 divide-y divide-border/50">
              {filteredBills.slice(0, 5).map((bill) => {
                const status = statusConfig[bill.status] || statusConfig.draft
                return (
                  <div key={bill.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{bill.title}</p>
                          <p className="text-xs text-muted-foreground">{bill.sejm_id} {bill.ministry && `• ${bill.ministry}`}</p>
                        </div>
                        <Badge className={`${status.color} shrink-0 text-[10px]`} variant="secondary">
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(bill.last_updated), { addSuffix: true, locale: pl })}
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredBills.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Nie znaleziono ustaw
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Wyświetlono {Math.min(filteredBills.length, 5)} z {filteredBills.length} wyników
            </p>
          </div>
        )

      case 'kalendarz':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Kalendarz posiedzeń</h2>
              <p className="text-sm text-muted-foreground">Nadchodzące posiedzenia Sejmu i Senatu</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Kalendarz posiedzeń jest dostępny po zalogowaniu</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/register">Załóż konto</Link>
              </Button>
            </div>
          </div>
        )

      case 'wyszukiwarka':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Wyszukiwarka AI
                <Badge className="bg-blue-500/20 text-blue-500 text-[10px]">Beta</Badge>
              </h2>
              <p className="text-sm text-muted-foreground">Zadaj pytanie w języku naturalnym</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-8 text-center">
              <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Wyszukiwarka AI pomoże Ci znaleźć ustawy</p>
              <p className="text-xs text-muted-foreground">np. "Pokaż ustawy dotyczące podatku VAT z ostatniego miesiąca"</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/register">Wypróbuj za darmo</Link>
              </Button>
            </div>
          </div>
        )

      case 'powiadomienia':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Powiadomienia</h2>
              <p className="text-sm text-muted-foreground">Zarządzaj alertami dla ustaw</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 divide-y divide-border/50">
              <div className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Bell className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ustawa podatkowa - nowy status</p>
                  <p className="text-xs text-muted-foreground">Zmiana statusu na "Komisja" • 2 godz. temu</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Bell className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nowy projekt - słowo kluczowe "VAT"</p>
                  <p className="text-xs text-muted-foreground">Nowy projekt pasujący do alertu • 1 dzień temu</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Bell className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Głosowanie w Senacie</p>
                  <p className="text-xs text-muted-foreground">Ustawa przeszła do Senatu • 3 dni temu</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'zapisane':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Zapisane ustawy</h2>
              <p className="text-sm text-muted-foreground">Twoje obserwowane projekty</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-8 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Zaloguj się, aby zapisywać ustawy</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/login">Zaloguj się</Link>
              </Button>
            </div>
          </div>
        )

      case 'ustawienia':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Ustawienia</h2>
              <p className="text-sm text-muted-foreground">Zarządzaj swoim kontem</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-8 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Ustawienia dostępne po zalogowaniu</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/login">Zaloguj się</Link>
              </Button>
            </div>
          </div>
        )

      case 'pomoc':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Pomoc</h2>
              <p className="text-sm text-muted-foreground">Jak korzystać ze Ścieżki Prawa</p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                <h3 className="text-sm font-medium mb-1">🔍 Jak szukać ustaw?</h3>
                <p className="text-xs text-muted-foreground">Użyj wyszukiwarki lub filtrów, aby znaleźć interesujące Cię projekty.</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                <h3 className="text-sm font-medium mb-1">🔔 Jak ustawić powiadomienia?</h3>
                <p className="text-xs text-muted-foreground">Po zalogowaniu możesz ustawić alerty dla konkretnych ustaw lub słów kluczowych.</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                <h3 className="text-sm font-medium mb-1">📊 Co oznaczają statusy?</h3>
                <p className="text-xs text-muted-foreground">Każda ustawa przechodzi przez etapy: czytania, komisję, Senat, podpis Prezydenta.</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-card/80 backdrop-blur-xl">
      {/* Browser Header */}
      <div className="h-10 border-b border-border/50 flex items-center px-4 justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 bg-background/50 rounded border border-border/50">
            sciezkaprawa.pl/{activeView === 'panel' ? 'dashboard' : activeView}
          </span>
        </div>
        <div className="w-16" />
      </div>

      {/* App Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* Sidebar */}
        <div className="md:col-span-3 lg:col-span-2 border-r border-border/50 bg-muted/5 hidden md:flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold">Ścieżka Prawa</span>
                <p className="text-[10px] text-muted-foreground">Śledzenie legislacji</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setStatusFilter(null); setSearchQuery(''); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-foreground font-medium' 
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${item.badgeColor}`}>
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Więcej</p>
              <div className="space-y-1">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-foreground font-medium' 
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 lg:col-span-10 bg-background/50 flex flex-col">
          {/* Header */}
          <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-background/30">
            <span className="text-sm font-medium capitalize">
              {activeView === 'panel' ? 'Panel' : navItems.find(n => n.id === activeView)?.label || secondaryNavItems.find(n => n.id === activeView)?.label}
            </span>
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-2 bg-muted/50 border border-border/50 rounded-md px-3 py-1.5 w-48 cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => setActiveView('ustawy')}
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Szukaj ustaw...</span>
              </div>
              <button 
                className="relative"
                onClick={() => setActiveView('powiadomienia')}
              >
                <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                FC
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <ScrollArea className="flex-1">
            {renderContent()}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
