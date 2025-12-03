'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Sparkles,
  Clock,
  X,
  ArrowRight,
  Loader2,
  History,
  Lightbulb,
  FileText,
  Trash2,
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

interface SearchResult {
  results: Bill[]
  analysis: {
    keywords: string[]
    category: string | null
    status: string | null
    submitterType: string | null
    dateFrom: string | null
    dateTo: string | null
  }
  totalResults: number
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Projekt', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  submitted: { label: 'Złożony', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  first_reading: { label: 'I czytanie', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  committee: { label: 'Komisja', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  second_reading: { label: 'II czytanie', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  third_reading: { label: 'III czytanie', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  senate: { label: 'Senat', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  presidential: { label: 'Prezydent', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  published: { label: 'Opublikowana', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected: { label: 'Odrzucona', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
}

const categoryLabels: Record<string, string> = {
  'finanse': '💰 Finanse i podatki',
  'prawo_karne': '⚖️ Prawo karne',
  'prawo_cywilne': '📜 Prawo cywilne',
  'zdrowie': '🏥 Zdrowie',
  'edukacja': '📚 Edukacja',
  'środowisko': '🌿 Środowisko',
  'obronność': '🛡️ Obronność',
  'cyfryzacja': '💻 Cyfryzacja',
  'praca_społeczna': '👥 Praca i polityka społeczna',
  'transport': '🚗 Transport',
  'rolnictwo': '🌾 Rolnictwo',
  'samorząd': '🏛️ Samorząd',
  'inne': '📋 Inne',
}

const submitterLabels: Record<string, string> = {
  'rządowy': 'Rządowy',
  'poselski': 'Poselski',
  'senacki': 'Senacki',
  'obywatelski': 'Obywatelski',
  'prezydencki': 'Prezydencki',
  'komisyjny': 'Komisyjny',
}

const exampleQueries = [
  'Projekty rządowe dotyczące podatków',
  'Ustawy o zdrowiu z 2024 roku',
  'Projekty poselskie w Senacie',
  'Ustawy o edukacji podpisane przez Prezydenta',
  'Projekty obywatelskie dotyczące środowiska',
]

const HISTORY_KEY = 'search-history'
const MAX_HISTORY = 10

export function SearchContent({ currentFilters }: SearchContentProps) {
  const [query, setQuery] = useState(currentFilters.q || '')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Załaduj historię z localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        setHistory([])
      }
    }
  }, [])

  // Zapisz historię do localStorage
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setHistory(prev => {
      const filtered = prev.filter(h => h !== searchQuery)
      const newHistory = [searchQuery, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query
    if (!q.trim()) return

    setIsSearching(true)
    setShowHistory(false)
    saveToHistory(q)

    try {
      const response = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResult(data)
      } else {
        console.error('Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    handleSearch(historyQuery)
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
    handleSearch(example)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Wyszukiwarka AI</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Zadaj pytanie po polsku, a AI znajdzie odpowiednie projekty ustaw
        </p>
      </div>

      {/* Search Box */}
      <Card className="shadow-lg border-2">
        <CardContent className="p-6">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Np. Znajdź projekty rządowe o podatkach z 2024 roku..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowHistory(true)}
                className="pl-12 pr-4 py-6 text-lg"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => { setQuery(''); setSearchResult(null); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-6 text-lg gap-2"
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Wyszukuję...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Szukaj z AI
                </>
              )}
            </Button>
          </form>

          {/* History Dropdown */}
          {showHistory && history.length > 0 && !searchResult && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                <span className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Ostatnie wyszukiwania
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Wyczyść
                </Button>
              </div>
              <div className="divide-y">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => handleHistoryClick(h)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{h}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example Queries */}
      {!searchResult && !isSearching && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">Przykładowe zapytania</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick(example)}
                className="text-sm"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isSearching && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">AI analizuje Twoje zapytanie...</p>
        </div>
      )}

      {/* Results */}
      {searchResult && !isSearching && (
        <div className="space-y-6">
          {/* Analysis Info */}
          {searchResult.analysis && (
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-muted-foreground">AI znalazło:</span>
                  {searchResult.analysis.keywords.length > 0 && (
                    <div className="flex gap-1">
                      {searchResult.analysis.keywords.slice(0, 3).map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                      ))}
                    </div>
                  )}
                  {searchResult.analysis.category && (
                    <Badge variant="outline">
                      {categoryLabels[searchResult.analysis.category] || searchResult.analysis.category}
                    </Badge>
                  )}
                  {searchResult.analysis.status && (
                    <Badge variant="outline">
                      Status: {statusLabels[searchResult.analysis.status]?.label || searchResult.analysis.status}
                    </Badge>
                  )}
                  {searchResult.analysis.submitterType && (
                    <Badge variant="outline">
                      Typ: {submitterLabels[searchResult.analysis.submitterType] || searchResult.analysis.submitterType}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Znaleziono {searchResult.totalResults} {searchResult.totalResults === 1 ? 'wynik' : 
                searchResult.totalResults < 5 ? 'wyniki' : 'wyników'}
            </h2>
          </div>

          {/* Results List */}
          {searchResult.results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Nie znaleziono ustaw pasujących do zapytania</p>
                <p className="text-sm text-muted-foreground mt-2">Spróbuj użyć innych słów kluczowych</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {searchResult.results.map((bill) => {
                  const status = statusLabels[bill.status] || statusLabels.draft
                  return (
                    <Link key={bill.id} href={`/bills/${bill.id}`}>
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium line-clamp-2">{bill.title}</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <span>{bill.sejm_id}</span>
                                {bill.last_updated && (
                                  <>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      Aktualizacja {formatDistanceToNow(new Date(bill.last_updated), {
                                        addSuffix: true,
                                        locale: pl,
                                      })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge className={status.color}>{status.label}</Badge>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}
