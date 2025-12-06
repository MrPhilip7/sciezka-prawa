'use client'

import { Calendar, CheckCircle2, Circle, Clock, FileText, Users, Building2, Scale, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface BillEvent {
  id: string
  event_type: string
  event_date: string
  description: string | null
  details?: any
}

interface LegislativeStage {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'completed' | 'current' | 'upcoming'
  date?: string
  event?: BillEvent
}

interface LegislativeTimelineProps {
  billStatus: string
  events: BillEvent[]
  submissionDate?: string | null
  consultationStartDate?: string | null
  consultationEndDate?: string | null
}

// Etapy formalnego procesu legislacyjnego w Sejmie
const statusOrder = [
  'submitted',
  'first_reading',
  'committee',
  'second_reading',
  'third_reading',
  'senate',
  'presidential',
  'published',
]

// Etapy przygotowawcze (pokazywane tylko jeśli istnieją)
const preparatoryStages = ['co_creation', 'preconsultation', 'draft']

const stageConfig: Record<string, { name: string; description: string; icon: any }> = {
  co_creation: {
    name: 'Współtworzenie',
    description: 'Wczesne konsultacje i zaangażowanie obywateli',
    icon: Users,
  },
  preconsultation: {
    name: 'Prekonsultacje',
    description: 'Konsultacje przed etapem legislacyjnym',
    icon: FileText,
  },
  draft: {
    name: 'Projekt',
    description: 'Przygotowanie projektu ustawy',
    icon: FileText,
  },
  submitted: {
    name: 'Wpłynięcie',
    description: 'Projekt wpłynął do Sejmu',
    icon: Building2,
  },
  first_reading: {
    name: 'I Czytanie',
    description: 'Pierwsze czytanie w Sejmie',
    icon: Eye,
  },
  committee: {
    name: 'Komisja',
    description: 'Prace w komisji sejmowej',
    icon: Users,
  },
  second_reading: {
    name: 'II Czytanie',
    description: 'Drugie czytanie w Sejmie',
    icon: Eye,
  },
  third_reading: {
    name: 'III Czytanie',
    description: 'Trzecie czytanie i głosowanie',
    icon: CheckCircle2,
  },
  senate: {
    name: 'Senat',
    description: 'Rozpatrywanie przez Senat',
    icon: Building2,
  },
  presidential: {
    name: 'Prezydent',
    description: 'Podpisanie przez Prezydenta',
    icon: Scale,
  },
  published: {
    name: 'Opublikowana',
    description: 'Ustawa weszła w życie',
    icon: CheckCircle2,
  },
  rejected: {
    name: 'Odrzucona',
    description: 'Projekt został odrzucony',
    icon: Circle,
  },
}

export function LegislativeTimeline({
  billStatus,
  events,
  submissionDate,
  consultationStartDate,
  consultationEndDate,
}: LegislativeTimelineProps) {
  const isRejected = billStatus === 'rejected'
  
  // Określ które etapy przygotowawcze pokazać (tylko te które faktycznie wystąpiły)
  const activePreparatoryStages = preparatoryStages.filter(stage => {
    if (stage === 'preconsultation' && consultationStartDate) return true
    if (stage === billStatus) return true
    // Sprawdź czy jest event dla tego etapu
    return events.some(e => e.event_type.toLowerCase().includes(stage))
  })

  // Łączymy etapy przygotowawcze z formalnymi
  const allStages = [...activePreparatoryStages, ...statusOrder]
  const currentStatusIndex = allStages.indexOf(billStatus)

  const stages: LegislativeStage[] = allStages.map((status, index) => {
    const config = stageConfig[status]
    const relatedEvent = events.find((e) => 
      e.event_type.toLowerCase().includes(status) || 
      (status === 'submitted' && e.event_type === 'submission') ||
      (status === 'preconsultation' && e.event_type.includes('consultation'))
    )

    let stageStatus: 'completed' | 'current' | 'upcoming'
    if (isRejected && status === 'rejected') {
      stageStatus = 'current'
    } else if (isRejected) {
      stageStatus = index <= currentStatusIndex ? 'completed' : 'upcoming'
    } else if (index < currentStatusIndex) {
      stageStatus = 'completed'
    } else if (index === currentStatusIndex) {
      stageStatus = 'current'
    } else {
      stageStatus = 'upcoming'
    }

    // Determine date
    let date: string | undefined
    if (relatedEvent) {
      date = relatedEvent.event_date
    } else if (status === 'submitted' && submissionDate) {
      date = submissionDate
    } else if (status === 'preconsultation' && consultationStartDate) {
      date = consultationStartDate
    }

    return {
      id: status,
      name: config.name,
      description: config.description,
      icon: config.icon,
      status: stageStatus,
      date,
      event: relatedEvent,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Ścieżka Legislacyjna
        </CardTitle>
        <CardDescription>
          Szczegółowy przebieg procesu legislacyjnego w Sejmie, Senacie i u Prezydenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border" />
          
          {/* Stages */}
          <div className="space-y-6">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              const isLast = index === stages.length - 1

              return (
                <div key={stage.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2',
                      stage.status === 'completed' && 'border-green-500 bg-green-50 dark:bg-green-950',
                      stage.status === 'current' && 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-4 ring-blue-100 dark:ring-blue-900',
                      stage.status === 'upcoming' && 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        stage.status === 'completed' && 'text-green-600 dark:text-green-400',
                        stage.status === 'current' && 'text-blue-600 dark:text-blue-400',
                        stage.status === 'upcoming' && 'text-gray-400 dark:text-gray-600'
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={cn(
                            'font-semibold',
                            stage.status === 'completed' && 'text-green-900 dark:text-green-100',
                            stage.status === 'current' && 'text-blue-900 dark:text-blue-100',
                            stage.status === 'upcoming' && 'text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {stage.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stage.description}
                        </p>

                        {/* Event description if available */}
                        {stage.event?.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {stage.event.description}
                          </p>
                        )}
                      </div>

                      {/* Date badge */}
                      {stage.date && (
                        <Badge
                          variant={stage.status === 'current' ? 'default' : 'outline'}
                          className="shrink-0"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {format(new Date(stage.date), 'd MMM yyyy', { locale: pl })}
                        </Badge>
                      )}
                    </div>

                    {/* Status badge */}
                    {stage.status === 'current' && (
                      <Badge className="mt-2" variant="default">
                        Aktualny etap
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary at bottom */}
        {consultationStartDate && consultationEndDate && (
          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <h4 className="font-semibold text-sm mb-2">Konsultacje społeczne</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(consultationStartDate), 'd MMMM yyyy', { locale: pl })} -{' '}
                {format(new Date(consultationEndDate), 'd MMMM yyyy', { locale: pl })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
