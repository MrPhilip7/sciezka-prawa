'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Send, 
  BookOpen, 
  Scale, 
  FileCheck, 
  Building,
  CheckCircle2,
  Circle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LegislativeTrainProps {
  currentStatus: string
  events?: Array<{
    event_type: string
    event_date: string
    description?: string
  }>
  consultationStartDate?: string | null
  consultationEndDate?: string | null
  className?: string
}

export function LegislativeTrain({ 
  currentStatus, 
  events = [],
  consultationStartDate,
  consultationEndDate,
  className 
}: LegislativeTrainProps) {
  
  const stages = [
    {
      id: 'co_creation',
      label: 'Współtworzenie',
      icon: Users,
      description: 'Inicjatywa i współtworzenie z interesariuszami',
      color: 'indigo',
    },
    {
      id: 'preconsultation',
      label: 'Prekonsultacje',
      icon: MessageSquare,
      description: 'Wczesne konsultacje społeczne',
      color: 'violet',
    },
    {
      id: 'draft',
      label: 'Projekt',
      icon: FileText,
      description: 'Przygotowanie projektu w RCL',
      color: 'gray',
    },
    {
      id: 'consultation',
      label: 'Konsultacje',
      icon: MessageSquare,
      description: 'Konsultacje publiczne',
      color: 'blue',
    },
    {
      id: 'submitted',
      label: 'Złożony',
      icon: Send,
      description: 'Projekt złożony do Sejmu',
      color: 'cyan',
    },
    {
      id: 'first_reading',
      label: 'I Czytanie',
      icon: BookOpen,
      description: 'Pierwsze czytanie w Sejmie',
      color: 'green',
    },
    {
      id: 'committee',
      label: 'Komisja',
      icon: Users,
      description: 'Prace w komisji sejmowej',
      color: 'teal',
    },
    {
      id: 'second_reading',
      label: 'II Czytanie',
      icon: BookOpen,
      description: 'Drugie czytanie i poprawki',
      color: 'lime',
    },
    {
      id: 'third_reading',
      label: 'III Czytanie',
      icon: BookOpen,
      description: 'Trzecie czytanie i głosowanie',
      color: 'amber',
    },
    {
      id: 'senate',
      label: 'Senat',
      icon: Building,
      description: 'Rozpatrzenie przez Senat',
      color: 'orange',
    },
    {
      id: 'presidential',
      label: 'Prezydent',
      icon: Scale,
      description: 'Podpis Prezydenta',
      color: 'red',
    },
    {
      id: 'published',
      label: 'Opublikowana',
      icon: FileCheck,
      description: 'Ustawa opublikowana w Dz.U.',
      color: 'emerald',
    },
  ]

  const currentIndex = stages.findIndex(s => s.id === currentStatus)
  const isRejected = currentStatus === 'rejected'

  return (
    <div className={cn('relative', className)}>
      {/* Train Track */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
        
        {/* Progress track */}
        {!isRejected && currentIndex >= 0 && (
          <div 
            className="absolute top-12 left-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000"
            style={{ 
              width: `${(currentIndex / (stages.length - 1)) * 100}%` 
            }}
          />
        )}

        {/* Stations (Stages) */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-2">
          {stages.map((stage, index) => {
            const isPassed = index < currentIndex
            const isCurrent = index === currentIndex
            const isFuture = index > currentIndex
            const StageIcon = stage.icon

            let status: 'completed' | 'current' | 'future' | 'rejected' = 'future'
            if (isRejected) {
              status = 'rejected'
            } else if (isPassed) {
              status = 'completed'
            } else if (isCurrent) {
              status = 'current'
            }

            return (
              <div key={stage.id} className="relative flex flex-col items-center text-center group">
                {/* Station Icon */}
                <div
                  className={cn(
                    'relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
                    {
                      'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-110': status === 'completed',
                      'bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-125 ring-4 ring-blue-200 dark:ring-blue-900 animate-pulse': status === 'current',
                      'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500': status === 'future',
                      'bg-gradient-to-br from-red-500 to-rose-600 text-white': status === 'rejected',
                    }
                  )}
                >
                  <StageIcon className="h-8 w-8" />
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1">
                    {status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 bg-white dark:bg-gray-900 rounded-full" />
                    )}
                    {status === 'rejected' && (
                      <XCircle className="h-5 w-5 text-red-600 bg-white dark:bg-gray-900 rounded-full" />
                    )}
                    {status === 'future' && (
                      <Circle className="h-5 w-5 text-gray-400 bg-white dark:bg-gray-900 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Label */}
                <div className="mt-4 space-y-1">
                  <Badge 
                    variant={status === 'current' ? 'default' : 'outline'}
                    className={cn({
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': status === 'completed',
                      'bg-blue-500 text-white': status === 'current',
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': status === 'rejected',
                    })}
                  >
                    {stage.label}
                  </Badge>
                  
                  {/* Description tooltip on hover */}
                  <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {stage.description}
                  </p>
                </div>

                {/* Event indicator */}
                {events.some(e => e.event_type.includes(stage.id)) && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                    <div className="w-3 h-3 bg-amber-500 rounded-full absolute top-0" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Consultation Timeline (if applicable) */}
      {(consultationStartDate || consultationEndDate) && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Okres Konsultacji</h4>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  {consultationStartDate && (
                    <span>Start: {new Date(consultationStartDate).toLocaleDateString('pl-PL')}</span>
                  )}
                  {consultationEndDate && (
                    <span>Koniec: {new Date(consultationEndDate).toLocaleDateString('pl-PL')}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Zakończone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-muted-foreground">Obecny etap</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-gray-400" />
          <span className="text-muted-foreground">Przyszłe etapy</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version for list views
 */
export function LegislativeTrainCompact({ currentStatus }: { currentStatus: string }) {
  const stages = [
    'co_creation',
    'preconsultation', 
    'draft',
    'consultation',
    'submitted',
    'first_reading',
    'committee',
    'second_reading',
    'third_reading',
    'senate',
    'presidential',
    'published',
  ]

  const currentIndex = stages.indexOf(currentStatus)
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Postęp legislacyjny</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
