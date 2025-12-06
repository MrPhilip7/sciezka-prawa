'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Lightbulb, BarChart3, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { marked } from 'marked'

interface SimpleLangaugeHelperProps {
  text: string
  title?: string
}

type Mode = 'simple' | 'impact' | 'summary' | 'explain'

const modeConfig: Record<Mode, { 
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = {
  simple: {
    label: 'Prosty Język',
    description: 'Przepisane na zrozumiały język',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400'
  },
  impact: {
    label: 'Analiza Skutków',
    description: 'Jak to wpłynie na obywateli i gospodarkę',
    icon: BarChart3,
    color: 'text-purple-600 dark:text-purple-400'
  },
  summary: {
    label: 'Streszczenie',
    description: 'Najważniejsze informacje w skrócie',
    icon: BookOpen,
    color: 'text-green-600 dark:text-green-400'
  },
  explain: {
    label: 'Wyjaśnienie',
    description: 'Szczegółowe wyjaśnienie przepisów',
    icon: Lightbulb,
    color: 'text-amber-600 dark:text-amber-400'
  }
}

export function SimpleLanguageHelper({ text, title }: SimpleLangaugeHelperProps) {
  const [activeMode, setActiveMode] = useState<Mode>('simple')
  const hasInitialized = useRef(false)
  
  // Generuj unikalny klucz cache na podstawie tekstu
  const cacheKey = `simple-lang-${text.substring(0, 100)}`
  
  // Załaduj cache z localStorage
  const [results, setResults] = useState<Partial<Record<Mode, string>>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const cached = localStorage.getItem(cacheKey)
      return cached ? JSON.parse(cached) : {}
    } catch {
      return {}
    }
  })
  const [loading, setLoading] = useState<Partial<Record<Mode, boolean>>>({})

  // Zapisz wyniki do localStorage gdy się zmieniają
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(results))
      } catch (error) {
        console.error('Failed to cache results:', error)
      }
    }
  }, [results, cacheKey])

  // Konfiguracja marked
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    })
  }, [])

  // Automatycznie przetwórz tekst dla domyślnego trybu przy pierwszym załadowaniu
  useEffect(() => {
    if (!hasInitialized.current && !results[activeMode] && !loading[activeMode]) {
      hasInitialized.current = true
      processText(activeMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Tylko przy montowaniu komponentu

  const processText = async (mode: Mode) => {
    if (results[mode]) {
      // Już mamy wynik dla tego trybu
      return
    }

    setLoading(prev => ({ ...prev, [mode]: true }))

    try {
      const response = await fetch('/api/ai/simple-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode })
      })

      const data = await response.json()
      
      if (data.response) {
        setResults(prev => ({ ...prev, [mode]: data.response }))
      } else {
        setResults(prev => ({ 
          ...prev, 
          [mode]: 'Przepraszam, nie udało się przetworzyć tekstu. Spróbuj ponownie.' 
        }))
      }
    } catch (error) {
      console.error(`Error processing ${mode}:`, error)
      setResults(prev => ({ 
        ...prev, 
        [mode]: 'Wystąpił błąd podczas przetwarzania. Spróbuj ponownie później.' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, [mode]: false }))
    }
  }

  const handleTabChange = (value: string) => {
    const mode = value as Mode
    setActiveMode(mode)
    
    // Automatycznie przetwórz tekst jeśli jeszcze tego nie zrobiliśmy
    if (!results[mode] && !loading[mode]) {
      processText(mode)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Pomoc w Zrozumieniu
        </CardTitle>
        <CardDescription>
          {title ? `Analiza: ${title}` : 'AI pomoże Ci zrozumieć ten dokument prawny'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeMode} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {(Object.entries(modeConfig) as [Mode, typeof modeConfig[Mode]][]).map(([mode, config]) => {
              const Icon = config.icon
              return (
                <TabsTrigger key={mode} value={mode} className="relative">
                  <Icon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="sm:hidden">{config.label.split(' ')[0]}</span>
                  {results[mode] && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-2 w-2 p-0"
                    />
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {(Object.keys(modeConfig) as Mode[]).map((mode) => {
            const config = modeConfig[mode]
            const Icon = config.icon
            const isLoading = loading[mode]
            const result = results[mode]

            return (
              <TabsContent key={mode} value={mode} className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.color)} />
                    <div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                  </div>

                  {!result && !isLoading && (
                    <div className="text-center py-8">
                      <Button onClick={() => processText(mode)}>
                        <Icon className="mr-2 h-4 w-4" />
                        Przetwórz tekst
                      </Button>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Analizuję dokument...
                        </p>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="prose prose-sm dark:prose-invert max-w-none markdown-content">
                      <div 
                        className="rounded-lg border bg-card p-6"
                        dangerouslySetInnerHTML={{ __html: marked.parse(result) }}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
