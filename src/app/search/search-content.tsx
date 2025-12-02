'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  X,
  FileText,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { Bill } from '@/types/supabase'

interface SearchContentProps {
  results: Bill[]
  totalCount: number
  filters: {
    submitterTypes: string[]
    categories: string[]
    years: number[]
    terms: number[]
  }
  currentFilters: {
    q?: string
    submitter?: string
    category?: string
    year?: string
    term?: string
    status?: string
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Projekt', color: 'bg-gray-100 text-gray-800' },
  submitted: { label: 'Złożony', color: 'bg-blue-100 text-blue-800' },
  first_reading: { label: 'I czytanie', color: 'bg-indigo-100 text-indigo-800' },
  committee: { label: 'Komisja', color: 'bg-purple-100 text-purple-800' },
  second_reading: { label: 'II czytanie', color: 'bg-pink-100 text-pink-800' },
  third_reading: { label: 'III czytanie', color: 'bg-orange-100 text-orange-800' },
  senate: { label: 'Senat', color: 'bg-yellow-100 text-yellow-800' },
  presidential: { label: 'Prezydent', color: 'bg-amber-100 text-amber-800' },
  published: { label: 'Opublikowana', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Odrzucona', color: 'bg-red-100 text-red-800' },
}

const submitterLabels: Record<string, string> = {
  'poselski': 'Poselski',
  'rządowy': 'Rządowy',
  'senacki': 'Senacki',
  'prezydencki': 'Prezydencki',
  'obywatelski': 'Obywatelski',
  'komisyjny': 'Komisyjny',
}

export function SearchContent({ results, totalCount, filters, currentFilters }: SearchContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(currentFilters.q || '')
  const [isSearching, setIsSearching] = useState(false)

  const hasActiveFilters = currentFilters.q || currentFilters.submitter || 
    currentFilters.category || currentFilters.year || currentFilters.term || currentFilters.status

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    
    router.push(`/search?${params.toString()}`)
    setTimeout(() => setIsSearching(false), 500)
  }

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/search')
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Wyszukiwarka</h1>
        <p className="text-muted-foreground mt-1">
          Przeszukuj bazę projektów ustaw
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Wyszukaj
          </CardTitle>
          <CardDescription>
            Wpisz frazę lub wybierz filtry, aby znaleźć interesujące Cię projekty ustaw
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Szukaj po tytule, opisie lub numerze..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Szukaj'
              )}
            </Button>
          </form>

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Typ wnioskodawcy</Label>
              <Select
                value={currentFilters.submitter || 'all'}
                onValueChange={(value) => updateFilter('submitter', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {filters.submitterTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {submitterLabels[type.toLowerCase()] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kategoria</Label>
              <Select
                value={currentFilters.category || 'all'}
                onValueChange={(value) => updateFilter('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {filters.categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rok</Label>
              <Select
                value={currentFilters.year || 'all'}
                onValueChange={(value) => updateFilter('year', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {filters.years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kadencja</Label>
              <Select
                value={currentFilters.term || 'all'}
                onValueChange={(value) => updateFilter('term', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {filters.terms.map((term) => (
                    <SelectItem key={term} value={String(term)}>
                      {term}. kadencja
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={currentFilters.status || 'all'}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {Object.entries(statusLabels).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Aktywne filtry:
              </span>
              {currentFilters.q && (
                <Badge variant="secondary" className="gap-1">
                  Szukaj: "{currentFilters.q}"
                </Badge>
              )}
              {currentFilters.submitter && (
                <Badge variant="secondary" className="gap-1">
                  Wnioskodawca: {submitterLabels[currentFilters.submitter.toLowerCase()] || currentFilters.submitter}
                </Badge>
              )}
              {currentFilters.category && (
                <Badge variant="secondary" className="gap-1">
                  Kategoria: {currentFilters.category}
                </Badge>
              )}
              {currentFilters.year && (
                <Badge variant="secondary" className="gap-1">
                  Rok: {currentFilters.year}
                </Badge>
              )}
              {currentFilters.term && (
                <Badge variant="secondary" className="gap-1">
                  Kadencja: {currentFilters.term}
                </Badge>
              )}
              {currentFilters.status && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusLabels[currentFilters.status]?.label || currentFilters.status}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Wyczyść filtry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wyniki wyszukiwania</span>
            <Badge variant="outline">{totalCount} {totalCount === 1 ? 'wynik' : 'wyników'}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Brak wyników</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? 'Nie znaleziono projektów spełniających kryteria. Spróbuj zmienić filtry.'
                  : 'Wpisz frazę lub wybierz filtry, aby rozpocząć wyszukiwanie.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((bill) => {
                const status = statusLabels[bill.status] || { label: bill.status, color: 'bg-gray-100 text-gray-800' }
                
                return (
                  <Link
                    key={bill.id}
                    href={`/bills/${bill.id}`}
                    className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            {bill.sejm_id}
                          </span>
                          <Badge className={status.color} variant="secondary">
                            {status.label}
                          </Badge>
                          {bill.submitter_type && (
                            <Badge variant="outline" className="text-xs">
                              {submitterLabels[bill.submitter_type.toLowerCase()] || bill.submitter_type}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium line-clamp-2">{bill.title}</h3>
                        {bill.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {bill.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(bill.last_updated), {
                              addSuffix: true,
                              locale: pl,
                            })}
                          </span>
                          {bill.term && (
                            <span>{bill.term}. kadencja</span>
                          )}
                          {bill.submission_year && (
                            <span>Rok {bill.submission_year}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
