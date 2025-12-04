'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Share2,
  CheckCircle2,
  ChevronRight,
  Loader2,
  XCircle,
  Vote,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Bill, BillEvent } from '@/types/supabase'
import { toast } from 'sonner'

// Types for voting data
interface ClubVotingStats {
  club: string
  total: number
  voted: number
  yes: number
  no: number
  abstain: number
  absent: number
}

interface VotingWithClubs {
  votingNumber: number
  sitting: number
  date: string
  title: string
  topic?: string
  totals: {
    yes: number
    no: number
    abstain: number
    notParticipating: number
  }
  clubs: ClubVotingStats[]
}

interface BillDetailContentProps {
  bill: Bill
  events: BillEvent[]
  hasAlert: boolean
  isLoggedIn: boolean
}

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  draft: { label: 'Projekt', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', step: 0 },
  submitted: { label: 'Złożony', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', step: 1 },
  first_reading: { label: 'I Czytanie', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', step: 2 },
  committee: { label: 'Komisja', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', step: 3 },
  second_reading: { label: 'II Czytanie', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', step: 4 },
  third_reading: { label: 'III Czytanie', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', step: 5 },
  senate: { label: 'Senat', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', step: 6 },
  presidential: { label: 'Prezydent', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', step: 7 },
  published: { label: 'Opublikowana', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', step: 8 },
  rejected: { label: 'Odrzucona', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', step: -1 },
}

// Etapy procesu legislacyjnego - zgodnie ze stroną Sejmu
const legislativeSteps = [
  { key: 'submitted', label: 'Wpływ', shortLabel: 'Wpływ' },
  { key: 'first_reading', label: 'I czytanie', shortLabel: 'I czyt.' },
  { key: 'committee', label: 'Komisje', shortLabel: 'Komisje' },
  { key: 'second_reading', label: 'II czytanie', shortLabel: 'II czyt.' },
  { key: 'third_reading', label: 'III czytanie', shortLabel: 'III czyt.' },
  { key: 'senate', label: 'Senat', shortLabel: 'Senat' },
  { key: 'presidential', label: 'Prezydent', shortLabel: 'Prezyd.' },
  { key: 'published', label: 'Dziennik Ustaw', shortLabel: 'Dz.U.' },
]

// Mapowanie wydarzeń na etapy
const eventToStepMap: Record<string, string[]> = {
  submitted: ['wpłynął', 'złożenie', 'projekt wpłynął', 'druk nr', 'start'],
  first_reading: ['i czytanie', 'pierwsze czytanie', 'skierowano do i czytania', 'czytanie w komisj', 'sejmreading'],
  committee: ['praca w komisjach po i czytaniu', 'komisj', 'sprawozdanie', 'posiedzenie komisji', 'committee'],
  second_reading: ['ii czytanie', 'drugie czytanie', 'praca w komisjach po ii czytaniu'],
  third_reading: ['iii czytanie', 'trzecie czytanie', 'głosowanie końcowe', 'uchwalenie', 'uchwalono'],
  senate: ['przekazano do senatu', 'senat', 'stanowisko senatu'],
  presidential: ['przekazano prezydentowi', 'prezydent', 'podpis prezydenta'],
  published: ['publikacja', 'dziennik ustaw', 'ogłoszono', 'opublikowano', 'publication'],
}

// Określ szczegółowy aktualny status (sub-etap)
function getCurrentDetailedStatus(events: BillEvent[]): string | null {
  if (events.length === 0) return null
  
  // Znajdź ostatnie wydarzenie chronologicznie
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  )
  
  const lastEvent = sortedEvents[0]
  const eventText = lastEvent.event_type.toLowerCase()
  
  // Specyficzne statusy
  if (eventText.includes('praca w komisjach po ii czytaniu')) {
    return 'W komisjach (po II czytaniu)'
  }
  if (eventText.includes('praca w komisjach po i czytaniu')) {
    return 'W komisjach (po I czytaniu)'
  }
  if (eventText.includes('przekazano do senatu') || eventText.includes('stanowisko senatu')) {
    return 'W Senacie'
  }
  if (eventText.includes('przekazano prezydentowi')) {
    return 'Oczekuje na podpis Prezydenta'
  }
  if (eventText.includes('skierowano do i czytania')) {
    return 'Skierowano do I czytania'
  }
  
  return null
}

// Określ aktualny etap na podstawie wydarzeń
function getCurrentStep(events: BillEvent[], status: string): number {
  let maxStep = -1
  
  // Najpierw sprawdź status
  const statusStep = statusConfig[status]?.step ?? 0
  if (statusStep > 0) {
    maxStep = statusStep - 1 // konwertuj na index
  }
  
  // Potem sprawdź wydarzenia - sortuj chronologicznie i analizuj
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )
  
  for (const event of sortedEvents) {
    const eventText = `${event.event_type} ${event.description || ''}`.toLowerCase()
    
    // Specjalna logika dla pracy w komisjach po II czytaniu - oznacza że II czytanie jest ukończone
    if (eventText.includes('praca w komisjach po ii czytaniu') || 
        eventText.includes('komisjach po ii czytaniu')) {
      maxStep = Math.max(maxStep, 4) // second_reading ukończone, między II a III
      continue
    }
    
    for (let i = 0; i < legislativeSteps.length; i++) {
      const stepKey = legislativeSteps[i].key
      const patterns = eventToStepMap[stepKey] || []
      
      if (patterns.some(p => eventText.includes(p))) {
        if (i > maxStep) maxStep = i
      }
    }
  }
  
  return Math.max(0, maxStep)
}

export function BillDetailContent({ bill, events, hasAlert: initialHasAlert, isLoggedIn }: BillDetailContentProps) {
  const router = useRouter()
  const [hasAlert, setHasAlert] = useState(initialHasAlert)
  const [isTogglingAlert, setIsTogglingAlert] = useState(false)
  const [votings, setVotings] = useState<VotingWithClubs[]>([])
  const [votingsLoading, setVotingsLoading] = useState(false)
  const [votingsLoaded, setVotingsLoaded] = useState(false)
  
  const status = statusConfig[bill.status] || statusConfig.draft
  const currentStep = getCurrentStep(events, bill.status)
  const detailedStatus = getCurrentDetailedStatus(events)
  const isRejected = bill.status === 'rejected'
  const isPublished = bill.status === 'published'

  // Fetch votings when tab is selected
  const loadVotings = async () => {
    if (votingsLoaded || votingsLoading) return
    
    setVotingsLoading(true)
    try {
      const response = await fetch(`/api/votings/${bill.sejm_id}`)
      if (response.ok) {
        const data = await response.json()
        setVotings(data.votings || [])
      }
    } catch (error) {
      console.error('Failed to load votings:', error)
    } finally {
      setVotingsLoading(false)
      setVotingsLoaded(true)
    }
  }

  const toggleAlert = async () => {
    if (!isLoggedIn) {
      router.push('/login?redirectTo=/bills/' + bill.id)
      return
    }

    setIsTogglingAlert(true)
    const supabase = createClient()

    try {
      if (hasAlert) {
        // Remove alert
        const { error } = await supabase
          .from('user_alerts')
          .delete()
          .eq('bill_id', bill.id)

        if (error) throw error
        setHasAlert(false)
        toast.success('Alert został usunięty')
      } else {
        // Add alert
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
          .from('user_alerts')
          .insert({
            user_id: user.id,
            bill_id: bill.id,
            is_active: true,
            notify_email: true,
          })

        if (error) throw error
        setHasAlert(true)
        toast.success('Alert został dodany')
      }
    } catch (error) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setIsTogglingAlert(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: bill.title,
        text: `Śledź postępy ustawy: ${bill.title}`,
        url: window.location.href,
      })
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link skopiowany do schowka')
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link href="/bills">
          <ArrowLeft className="h-4 w-4" />
          Powrót do listy ustaw
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={status.color} variant="secondary">
              {status.label}
            </Badge>
            <Badge variant="outline">{bill.sejm_id}</Badge>
            {bill.document_type && (
              <Badge variant="outline">{bill.document_type}</Badge>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold">{bill.title}</h1>
          {bill.ministry && (
            <p className="text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {bill.ministry}
            </p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            variant={hasAlert ? 'secondary' : 'default'}
            onClick={toggleAlert}
            disabled={isTogglingAlert}
            className="gap-2"
          >
            {isTogglingAlert ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasAlert ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            {hasAlert ? 'Usuń alert' : 'Dodaj alert'}
          </Button>
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Udostępnij
          </Button>
          {bill.external_url && (
            <Button variant="outline" asChild className="gap-2">
              <a href={bill.external_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Sejm.gov.pl
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Progress Steps - prosty układ ze strzałkami */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Postęp legislacyjny</CardTitle>
          {isRejected && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 mt-1">
              <XCircle className="h-4 w-4" />
              Projekt został odrzucony
            </p>
          )}
        </CardHeader>
        <CardContent>
          {/* Pasek postępu ze strzałkami - pokazuje też odrzucone projekty */}
          <div className="overflow-x-auto">
            <div className="flex items-center min-w-max py-2">
              {legislativeSteps.map((step, index) => {
                // Dla odrzuconych: etapy przed currentStep są ukończone, currentStep to miejsce odrzucenia
                const isCompleted = isRejected 
                  ? index < currentStep 
                  : index < currentStep
                const isRejectionPoint = isRejected && index === currentStep
                const isCurrent = !isRejected && index === currentStep
                const isPending = isRejected 
                  ? index > currentStep 
                  : index > currentStep
                
                return (
                  <div key={step.key} className="flex items-center">
                    {/* Etap */}
                    <div className={`
                      flex flex-col items-center px-2 sm:px-3
                      ${isCompleted ? 'text-green-600 dark:text-green-400' : ''}
                      ${isRejectionPoint ? 'text-red-600 dark:text-red-400 font-semibold' : ''}
                      ${isCurrent ? 'text-primary font-semibold' : ''}
                      ${isPending ? 'text-muted-foreground/50' : ''}
                    `}>
                      {/* Ikona/Kółko */}
                      <div className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1
                        transition-colors duration-200
                        ${isCompleted ? 'bg-green-100 dark:bg-green-900' : ''}
                        ${isRejectionPoint ? 'bg-red-100 dark:bg-red-900 ring-2 ring-red-500' : ''}
                        ${isCurrent ? 'bg-primary/20 ring-2 ring-primary' : ''}
                        ${isPending ? 'bg-muted/50' : ''}
                      `}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                        ) : isRejectionPoint ? (
                          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <span className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground/50'}`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      {/* Label */}
                      <span className="text-[10px] sm:text-xs text-center whitespace-nowrap">
                        <span className="hidden sm:inline">{step.label}</span>
                        <span className="sm:hidden">{step.shortLabel}</span>
                      </span>
                    </div>
                    
                    {/* Strzałka między etapami */}
                    {index < legislativeSteps.length - 1 && (
                      <ChevronRight className={`
                        h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0
                        ${index < currentStep ? 'text-green-500 dark:text-green-400' : ''}
                        ${isRejectionPoint ? 'text-red-400/50' : ''}
                        ${isPending && !isRejectionPoint ? 'text-muted-foreground/30' : ''}
                      `} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Aktualny szczegółowy status */}
          {detailedStatus && !isRejected && !isPublished && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-center">
                <span className="text-muted-foreground">Aktualnie: </span>
                <span className="font-medium text-primary">{detailedStatus}</span>
              </p>
            </div>
          )}
          
          {/* Link do strony Sejmu */}
          {bill.external_url && (
            <div className="mt-4 pt-3 border-t text-center">
              <a 
                href={bill.external_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Zobacz pełny przebieg na Sejm.gov.pl
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for details and timeline */}
      <Tabs defaultValue="details" className="space-y-6" onValueChange={(value) => {
        if (value === 'votings') loadVotings()
      }}>
        <TabsList>
          <TabsTrigger value="details">Szczegóły</TabsTrigger>
          <TabsTrigger value="timeline">Historia ({events.length})</TabsTrigger>
          <TabsTrigger value="votings" className="gap-1.5">
            <Vote className="h-4 w-4" />
            Głosowania
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Opis projektu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {bill.description || 'Brak opisu dla tego projektu ustawy.'}
              </p>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informacje</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Numer druku</dt>
                  <dd className="text-lg font-semibold">{bill.sejm_id}</dd>
                </div>
                {bill.submission_date && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Data złożenia</dt>
                    <dd className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(bill.submission_date), 'd MMMM yyyy', { locale: pl })}
                    </dd>
                  </div>
                )}
                {bill.ministry && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Ministerstwo</dt>
                    <dd className="text-lg font-semibold">{bill.ministry}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Ostatnia aktualizacja</dt>
                  <dd className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(new Date(bill.last_updated), {
                      addSuffix: true,
                      locale: pl,
                    })}
                  </dd>
                </div>
                {bill.submitter_type && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Typ wnioskodawcy</dt>
                    <dd className="text-lg font-semibold capitalize">{bill.submitter_type}</dd>
                  </div>
                )}
                {bill.category && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Kategoria</dt>
                    <dd className="text-lg font-semibold capitalize">{bill.category.replace('_', ' ')}</dd>
                  </div>
                )}
                {bill.term && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Kadencja Sejmu</dt>
                    <dd className="text-lg font-semibold">{bill.term}. kadencja</dd>
                  </div>
                )}
                {bill.tags && bill.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground mb-2">Tagi</dt>
                    <dd className="flex flex-wrap gap-2">
                      {bill.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Historia zmian</CardTitle>
              <CardDescription>
                Chronologiczny przebieg prac nad projektem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Brak zarejestrowanych wydarzeń dla tego projektu</p>
                </div>
              ) : (
                <div className="relative pl-8 space-y-8">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-muted" />

                  {events.map((event, index) => (
                    <div key={event.id} className="relative">
                      {/* Dot */}
                      <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(event.event_date), 'd MMMM yyyy', { locale: pl })}
                        </div>
                        <h4 className="font-medium">{event.event_type}</h4>
                        {event.description && (
                          <p className="text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5" />
                Głosowania nad projektem
              </CardTitle>
              <CardDescription>
                Wyniki głosowań z podziałem na kluby parlamentarne
              </CardDescription>
            </CardHeader>
            <CardContent>
              {votingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : votings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Brak zarejestrowanych głosowań dla tego projektu</p>
                  <p className="text-sm mt-1">Głosowania pojawiają się podczas kolejnych czytań</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {votings.map((voting, vIndex) => (
                    <div key={`${voting.sitting}-${voting.votingNumber}`} className="space-y-4">
                      {vIndex > 0 && <div className="border-t pt-6" />}
                      
                      {/* Voting header */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(voting.date), 'd MMMM yyyy, HH:mm', { locale: pl })}
                          <span className="mx-1">•</span>
                          <span>Posiedzenie {voting.sitting}, głosowanie nr {voting.votingNumber}</span>
                        </div>
                        <h4 className="font-medium">{voting.title}</h4>
                        {voting.topic && (
                          <p className="text-sm text-muted-foreground">{voting.topic}</p>
                        )}
                      </div>

                      {/* Voting summary */}
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Za: {voting.totals.yes}
                        </Badge>
                        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Przeciw: {voting.totals.no}
                        </Badge>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          Wstrzymało się: {voting.totals.abstain}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Nie głosowało: {voting.totals.notParticipating}
                        </Badge>
                      </div>

                      {/* Club breakdown table */}
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="font-semibold">Klub/Koło</TableHead>
                              <TableHead className="text-center font-semibold">Liczba czł.</TableHead>
                              <TableHead className="text-center font-semibold">Głosowało</TableHead>
                              <TableHead className="text-center font-semibold text-green-700 dark:text-green-400">Za</TableHead>
                              <TableHead className="text-center font-semibold text-red-700 dark:text-red-400">Przeciw</TableHead>
                              <TableHead className="text-center font-semibold text-amber-700 dark:text-amber-400">Wstrzymało się</TableHead>
                              <TableHead className="text-center font-semibold text-gray-500">Nie głosowało</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {voting.clubs.map((club) => (
                              <TableRow key={club.club} className="hover:bg-muted/30">
                                <TableCell className="font-medium">{club.club}</TableCell>
                                <TableCell className="text-center">{club.total}</TableCell>
                                <TableCell className="text-center">{club.voted}</TableCell>
                                <TableCell className="text-center">
                                  {club.yes > 0 ? (
                                    <span className="text-green-600 dark:text-green-400 font-semibold">{club.yes}</span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {club.no > 0 ? (
                                    <span className="text-red-600 dark:text-red-400 font-semibold">{club.no}</span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {club.abstain > 0 ? (
                                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{club.abstain}</span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {club.absent > 0 ? (
                                    <span className="text-gray-500">{club.absent}</span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
