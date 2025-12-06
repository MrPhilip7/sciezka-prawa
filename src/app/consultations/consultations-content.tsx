'use client'

import { useState, useMemo } from 'react'
import { Calendar, Clock, Building2, Users, FileText, MessageSquare, ExternalLink, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'
import { pl } from 'date-fns/locale'
import Link from 'next/link'
import { AlertButton } from '@/components/bills/alert-button'

type Bill = any // Would be typed from Database schema

interface ConsultationsContentProps {
  consultationBills: Bill[]
  upcomingBills: Bill[]
  consultationEvents: any[]
}

export function ConsultationsContent({ 
  consultationBills, 
  upcomingBills,
  consultationEvents 
}: ConsultationsContentProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'history'>('active')
  const [filterMinistry, setFilterMinistry] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'preconsultation' | 'consultation'>('all')

  // Categorize bills
  const { activeBills, completedBills } = useMemo(() => {
    const now = new Date()
    const active: Bill[] = []
    const completed: Bill[] = []

    for (const bill of consultationBills) {
      if (bill.consultation_end_date && isBefore(new Date(bill.consultation_end_date), now)) {
        completed.push(bill)
      } else {
        active.push(bill)
      }
    }

    return { activeBills: active, completedBills: completed }
  }, [consultationBills])

  // Get unique ministries for filter
  const ministries = useMemo(() => {
    const set = new Set<string>()
    consultationBills.forEach(bill => {
      if (bill.ministry) set.add(bill.ministry)
    })
    return Array.from(set).sort()
  }, [consultationBills])

  // Filter bills
  const filteredActiveBills = useMemo(() => {
    return activeBills.filter(bill => {
      if (filterMinistry && bill.ministry !== filterMinistry) return false
      if (filterType !== 'all') {
        if (filterType === 'preconsultation' && bill.status !== 'preconsultation' && bill.status !== 'co_creation') return false
        if (filterType === 'consultation' && bill.status !== 'consultation') return false
      }
      return true
    })
  }, [activeBills, filterMinistry, filterType])

  const filteredUpcomingBills = useMemo(() => {
    return upcomingBills.filter(bill => {
      if (filterMinistry && bill.ministry !== filterMinistry) return false
      return true
    })
  }, [upcomingBills, filterMinistry])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Konsultacje i Prekonsultacje</h1>
        <p className="text-muted-foreground mt-2">
          Aktualne i nadchodzące konsultacje społeczne projektów ustaw
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBills.length}</p>
                <p className="text-sm text-muted-foreground">Aktywne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingBills.length}</p>
                <p className="text-sm text-muted-foreground">Nadchodzące</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activeBills.filter(b => b.status === 'preconsultation' || b.status === 'co_creation').length}
                </p>
                <p className="text-sm text-muted-foreground">Prekonsultacje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedBills.length}</p>
                <p className="text-sm text-muted-foreground">Zakończone</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtry:</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                Wszystkie
              </Button>
              <Button
                variant={filterType === 'preconsultation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('preconsultation')}
              >
                Prekonsultacje
              </Button>
              <Button
                variant={filterType === 'consultation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('consultation')}
              >
                Konsultacje
              </Button>
            </div>

            {ministries.length > 0 && (
              <select
                value={filterMinistry || ''}
                onChange={(e) => setFilterMinistry(e.target.value || null)}
                className="px-3 py-1.5 text-sm border rounded-md bg-background"
              >
                <option value="">Wszystkie ministerstwa</option>
                {ministries.map(ministry => (
                  <option key={ministry} value={ministry}>{ministry}</option>
                ))}
              </select>
            )}

            {(filterMinistry || filterType !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterMinistry(null)
                  setFilterType('all')
                }}
              >
                Wyczyść filtry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="active">
            Aktywne ({filteredActiveBills.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Nadchodzące ({filteredUpcomingBills.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Historia ({completedBills.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredActiveBills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Brak aktywnych konsultacji pasujących do wybranych filtrów
              </CardContent>
            </Card>
          ) : (
            filteredActiveBills.map(bill => (
              <ConsultationCard key={bill.id} bill={bill} />
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcomingBills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Brak nadchodzących konsultacji
              </CardContent>
            </Card>
          ) : (
            filteredUpcomingBills.map(bill => (
              <ConsultationCard key={bill.id} bill={bill} isUpcoming />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {completedBills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Brak zakończonych konsultacji
              </CardContent>
            </Card>
          ) : (
            completedBills.map(bill => (
              <ConsultationCard key={bill.id} bill={bill} isCompleted />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConsultationCard({ 
  bill, 
  isUpcoming = false, 
  isCompleted = false 
}: { 
  bill: Bill
  isUpcoming?: boolean
  isCompleted?: boolean
}) {
  const statusConfig = {
    co_creation: { label: 'Współtworzenie', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
    preconsultation: { label: 'Prekonsultacje', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' },
    consultation: { label: 'Konsultacje', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  }

  const status = statusConfig[bill.status as keyof typeof statusConfig]
  const daysRemaining = bill.consultation_end_date 
    ? Math.ceil((new Date(bill.consultation_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {status && (
                <Badge className={status.color}>
                  {status.label}
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="outline">Zakończone</Badge>
              )}
              {isUpcoming && (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                  Nadchodzące
                </Badge>
              )}
              {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7 && (
                <Badge variant="destructive">
                  Kończy się za {daysRemaining} dni
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">
              <Link href={`/bills/${bill.id}`} className="hover:underline">
                {bill.title}
              </Link>
            </CardTitle>
            {bill.ministry && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {bill.ministry}
              </div>
            )}
          </div>
          <AlertButton billId={bill.id} billTitle={bill.title} variant="icon-only" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {bill.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bill.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {bill.consultation_start_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Start: {format(new Date(bill.consultation_start_date), 'dd MMM yyyy', { locale: pl })}
              </span>
            </div>
          )}
          {bill.consultation_end_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Koniec: {format(new Date(bill.consultation_end_date), 'dd MMM yyyy', { locale: pl })}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/bills/${bill.id}`}>
              <FileText className="h-4 w-4 mr-2" />
              Szczegóły projektu
            </Link>
          </Button>

          {bill.consultation_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={bill.consultation_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Weź udział w konsultacjach
              </a>
            </Button>
          )}

          {bill.impact_assessment_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={bill.impact_assessment_url} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                Ocena Skutków Regulacji
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
