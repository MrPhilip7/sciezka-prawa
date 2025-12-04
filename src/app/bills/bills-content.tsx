'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  ExternalLink,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { Bill } from '@/types/supabase'

interface BillsContentProps {
  bills: Bill[]
  totalCount: number
  currentPage: number
  years: number[]
  tags: string[]
  filters: {
    query: string
    status: string
    submitter: string
    category: string
    year: string
    term: string
    tag: string
  }
  sorting: {
    field: string
    order: string
  }
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

const statusOptions = [
  { value: 'all', label: 'Wszystkie statusy' },
  { value: 'draft', label: 'Projekt' },
  { value: 'submitted', label: 'Złożony' },
  { value: 'first_reading', label: 'I Czytanie' },
  { value: 'committee', label: 'Komisja' },
  { value: 'second_reading', label: 'II Czytanie' },
  { value: 'third_reading', label: 'III Czytanie' },
  { value: 'senate', label: 'Senat' },
  { value: 'presidential', label: 'Prezydent' },
  { value: 'published', label: 'Opublikowana' },
  { value: 'rejected', label: 'Odrzucona' },
]

const sortOptions = [
  { value: 'last_updated', label: 'Data aktualizacji' },
  { value: 'submission_date', label: 'Data złożenia' },
  { value: 'title', label: 'Tytuł (A-Z)' },
]

const submitterOptions = [
  { value: 'all', label: 'Wszyscy wnioskodawcy' },
  { value: 'rządowy', label: 'Rządowy' },
  { value: 'poselski', label: 'Poselski' },
  { value: 'senacki', label: 'Senacki' },
  { value: 'obywatelski', label: 'Obywatelski' },
  { value: 'prezydencki', label: 'Prezydencki' },
  { value: 'komisyjny', label: 'Komisyjny' },
  { value: 'inny', label: 'Inny' },
]

const categoryOptions = [
  { value: 'all', label: 'Wszystkie kategorie' },
  { value: 'finanse', label: '💰 Finanse i podatki' },
  { value: 'prawo_karne', label: '⚖️ Prawo karne' },
  { value: 'prawo_cywilne', label: '📜 Prawo cywilne' },
  { value: 'zdrowie', label: '🏥 Zdrowie' },
  { value: 'edukacja', label: '📚 Edukacja' },
  { value: 'środowisko', label: '🌿 Środowisko' },
  { value: 'obronność', label: '🛡️ Obronność' },
  { value: 'cyfryzacja', label: '💻 Cyfryzacja' },
  { value: 'praca_społeczna', label: '👥 Praca i polityka społeczna' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'rolnictwo', label: '🌾 Rolnictwo' },
  { value: 'samorząd', label: '🏛️ Samorząd' },
  { value: 'inne', label: '📋 Inne' },
]

const termOptions = [
  { value: 'all', label: 'Wszystkie kadencje' },
  { value: '10', label: 'X Kadencja (2023-)' },
  { value: '9', label: 'IX Kadencja (2019-2023)' },
  { value: '8', label: 'VIII Kadencja (2015-2019)' },
]

export function BillsContent({ bills, totalCount, currentPage, years, tags, filters, sorting }: BillsContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(filters.query)
  
  const limit = 10
  const totalPages = Math.ceil(totalCount / limit)

  const updateFilters = (updates: Partial<typeof filters & { sort?: string; order?: string }>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key === 'query' ? 'q' : key, value)
      } else {
        params.delete(key === 'query' ? 'q' : key)
      }
    })
    
    // Reset to page 1 when filters change
    if (!updates.hasOwnProperty('page')) {
      params.delete('page')
    }
    
    router.push(`/bills?${params.toString()}`)
  }

  const updateSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Toggle order if same field, otherwise default to desc
    if (sorting.field === field) {
      params.set('order', sorting.order === 'desc' ? 'asc' : 'desc')
    } else {
      params.set('sort', field)
      params.set('order', 'desc')
    }
    params.delete('page')
    
    router.push(`/bills?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ query: searchQuery })
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push('/bills')
  }

  const hasActiveFilters = filters.query || 
    filters.status !== 'all' || 
    filters.submitter !== 'all' || 
    filters.category !== 'all' ||
    filters.year !== 'all' ||
    filters.term !== 'all' ||
    filters.tag !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ustawy</h2>
        <p className="text-muted-foreground">
          Przeglądaj i wyszukuj projekty ustaw w procesie legislacyjnym
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filtry</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Szukaj po tytule, numerze druku lub opisie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Szukaj</Button>
            </form>

            <div className="flex flex-wrap gap-4">
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilters({ status: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.submitter}
                onValueChange={(value) => updateFilters({ submitter: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Wnioskodawca" />
                </SelectTrigger>
                <SelectContent>
                  {submitterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) => updateFilters({ category: value })}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Kategoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select
                value={filters.year}
                onValueChange={(value) => updateFilters({ year: value })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie lata</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.term}
                onValueChange={(value) => updateFilters({ term: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Kadencja" />
                </SelectTrigger>
                <SelectContent>
                  {termOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.tag}
                onValueChange={(value) => updateFilters({ tag: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie tagi</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      #{tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Wyczyść filtry
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results & Sorting */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">
          Znaleziono <strong>{totalCount}</strong> {totalCount === 1 ? 'ustawę' : 'ustaw'}
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sortuj:</span>
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={sorting.field === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSort(option.value)}
              className="gap-1"
            >
              {option.label}
              {sorting.field === option.value && (
                sorting.order === 'desc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {bills.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nie znaleziono ustaw</p>
              <p className="text-muted-foreground text-center mt-2">
                Spróbuj zmienić kryteria wyszukiwania lub wyczyść filtry
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Wyczyść filtry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          bills.map((bill) => {
            const status = statusConfig[bill.status] || statusConfig.draft
            return (
              <Card key={bill.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
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
                      
                      {bill.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2">
                          {bill.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        {bill.ministry && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {bill.ministry}
                          </span>
                        )}
                        {bill.submission_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(bill.submission_date), 'd MMM yyyy', { locale: pl })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Ostatnia zmiana{' '}
                          {formatDistanceToNow(new Date(bill.last_updated), {
                            addSuffix: true,
                            locale: pl,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 shrink-0">
                      <Button asChild>
                        <Link href={`/bills/${bill.id}`}>
                          Zobacz szczegóły
                        </Link>
                      </Button>
                      {bill.external_url && (
                        <Button variant="outline" asChild>
                          <a href={bill.external_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Sejm.gov.pl
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => updateFilters({ page: String(currentPage - 1) } as unknown as Partial<typeof filters>)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => updateFilters({ page: String(pageNum) } as unknown as Partial<typeof filters>)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => updateFilters({ page: String(currentPage + 1) } as unknown as Partial<typeof filters>)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
