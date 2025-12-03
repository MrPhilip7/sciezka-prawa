'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Circle,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Bill, BillEvent } from '@/types/supabase'
import { toast } from 'sonner'

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

const legislativeSteps = [
  { key: 'submitted', label: 'Złożenie projektu', eventTypes: ['wpłynął', 'złożenie', 'projekt wpłynął', 'druk nr', 'submitted'] },
  { key: 'first_reading', label: 'I Czytanie', eventTypes: ['i czytanie', 'pierwsze czytanie', 'skierowano do i czytania', 'first_reading', 'czytania w komisj', 'czytanie w komisj'] },
  { key: 'committee', label: 'Prace w komisji', eventTypes: ['komisj', 'skierowano do komisji', 'prace w komisji', 'sprawozdanie komisji', 'committee', 'posiedzenie komisji'] },
  { key: 'second_reading', label: 'II Czytanie', eventTypes: ['ii czytanie', 'drugie czytanie', 'second_reading'] },
  { key: 'third_reading', label: 'III Czytanie', eventTypes: ['iii czytanie', 'trzecie czytanie', 'głosowanie', 'uchwalenie', 'third_reading'] },
  { key: 'senate', label: 'Senat', eventTypes: ['przekazano do senatu', 'senat', 'stanowisko senatu', 'senate'] },
  { key: 'presidential', label: 'Prezydent', eventTypes: ['przekazano prezydentowi', 'prezydent', 'podpis prezydenta', 'presidential'] },
  { key: 'published', label: 'Publikacja', eventTypes: ['publikacja', 'dziennik ustaw', 'ogłoszono', 'opublikowano', 'published'] },
]

// Funkcja do określenia ukończonych etapów na podstawie wydarzeń
function getCompletedSteps(events: BillEvent[], currentStatus: string): Set<string> {
  const completed = new Set<string>()
  
  // Dodaj etapy na podstawie wydarzeń
  events.forEach(event => {
    const eventTypeLower = event.event_type.toLowerCase()
    const descriptionLower = (event.description || '').toLowerCase()
    const fullText = `${eventTypeLower} ${descriptionLower}`
    
    legislativeSteps.forEach(step => {
      if (step.eventTypes.some(et => fullText.includes(et.toLowerCase()))) {
        completed.add(step.key)
      }
    })
  })
  
  // Dodaj etapy na podstawie obecnego statusu (jako fallback)
  const statusStep = statusConfig[currentStatus]?.step || 0
  if (statusStep > 0) {
    legislativeSteps.forEach((step, index) => {
      if (index < statusStep) {
        completed.add(step.key)
      }
    })
  }
  
  return completed
}

// Funkcja do określenia aktualnego etapu na podstawie wydarzeń
function getCurrentStepFromEvents(events: BillEvent[], currentStatus: string): number {
  let maxStepIndex = -1
  
  events.forEach(event => {
    const eventTypeLower = event.event_type.toLowerCase()
    const descriptionLower = (event.description || '').toLowerCase()
    const fullText = `${eventTypeLower} ${descriptionLower}`
    
    legislativeSteps.forEach((step, index) => {
      if (step.eventTypes.some(et => fullText.includes(et.toLowerCase()))) {
        if (index > maxStepIndex) {
          maxStepIndex = index
        }
      }
    })
  })
  
  // Fallback do statusu
  if (maxStepIndex === -1) {
    const statusStep = statusConfig[currentStatus]?.step || 0
    maxStepIndex = statusStep - 1 // step w statusConfig jest 1-based
  }
  
  return maxStepIndex
}

// Funkcja do znalezienia daty dla danego etapu
function getStepDate(events: BillEvent[], step: typeof legislativeSteps[0]): string | null {
  for (const event of events) {
    const eventTypeLower = event.event_type.toLowerCase()
    const descriptionLower = (event.description || '').toLowerCase()
    const fullText = `${eventTypeLower} ${descriptionLower}`
    
    if (step.eventTypes.some(et => fullText.includes(et.toLowerCase()))) {
      return event.event_date
    }
  }
  return null
}

export function BillDetailContent({ bill, events, hasAlert: initialHasAlert, isLoggedIn }: BillDetailContentProps) {
  const router = useRouter()
  const [hasAlert, setHasAlert] = useState(initialHasAlert)
  const [isTogglingAlert, setIsTogglingAlert] = useState(false)
  
  const status = statusConfig[bill.status] || statusConfig.draft
  const completedSteps = getCompletedSteps(events, bill.status)
  
  // Znajdź aktualny etap na podstawie wydarzeń
  const currentStepIndex = getCurrentStepFromEvents(events, bill.status)

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

      {/* Progress Steps */}
      {bill.status !== 'rejected' && (
        <Card>
          <CardHeader>
            <CardTitle>Postęp legislacyjny</CardTitle>
            <CardDescription>
              {events.length > 0 
                ? `Na podstawie ${events.length} zarejestrowanych wydarzeń`
                : 'Aktualna pozycja projektu w procesie legislacyjnym'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-muted" />
              <div 
                className="absolute left-4 top-4 w-0.5 bg-primary transition-all duration-500"
                style={{ height: `${Math.min((currentStepIndex / (legislativeSteps.length - 1)) * 100, 100)}%` }}
              />

              {/* Steps */}
              <div className="space-y-6">
                {legislativeSteps.map((step, index) => {
                  // Etap jest ukończony jeśli jest przed aktualnym lub ma wydarzenie
                  const isCompleted = index < currentStepIndex || (index === currentStepIndex && completedSteps.has(step.key))
                  const isCurrent = index === currentStepIndex
                  const stepDate = getStepDate(events, step)
                  
                  return (
                    <div key={step.key} className="relative flex items-center gap-4 pl-8">
                      <div className={`
                        absolute left-2 -translate-x-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${isCompleted ? 'bg-primary border-primary' : isCurrent ? 'bg-background border-primary' : 'bg-background border-muted'}
                      `}>
                        {isCompleted && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                        {isCurrent && !isCompleted && <Circle className="h-2 w-2 fill-primary text-primary" />}
                      </div>
                      <div className={`flex-1 ${isCurrent || isCompleted ? 'font-medium' : ''} ${!isCompleted && !isCurrent ? 'text-muted-foreground' : ''}`}>
                        <span>{step.label}</span>
                        {stepDate && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({format(new Date(stepDate), 'd MMM yyyy', { locale: pl })})
                          </span>
                        )}
                      </div>
                      {isCurrent && !isCompleted && (
                        <Badge variant="outline" className="text-xs bg-primary/10">
                          W trakcie
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="secondary" className="text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {events.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                ⚠️ Brak szczegółowych danych o przebiegu - pokazano szacowany stan na podstawie statusu
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for details and timeline */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Szczegóły</TabsTrigger>
          <TabsTrigger value="timeline">Historia ({events.length})</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
