'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Database, Clock, Timer } from 'lucide-react'
import { toast } from 'sonner'

interface SyncResult {
  success: boolean
  message: string
  total?: number
  inserted?: number
  updated?: number
  errors?: string[]
}

const STORAGE_KEY = 'autosync_settings'

interface AutoSyncSettings {
  enabled: boolean
  interval: number // in minutes
}

export default function SyncPage() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [autoSync, setAutoSync] = useState<AutoSyncSettings>({ enabled: false, interval: 60 })
  const [nextSyncIn, setNextSyncIn] = useState<number | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('pl-PL')}] ${message}`])
  }, [])

  const syncData = useCallback(async (isAutomatic = false) => {
    setIsSyncing(true)
    if (!isAutomatic) {
      setLogs([])
    }
    setResult(null)

    try {
      addLog(isAutomatic ? '🔄 Automatyczna synchronizacja...' : 'Rozpoczynam synchronizację danych z Sejm API...')
      
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      setLastSyncTime(new Date())
      
      if (data.success) {
        addLog(`✅ Synchronizacja zakończona pomyślnie`)
        addLog(`📥 Znaleziono: ${data.total || 0} procesów legislacyjnych`)
        addLog(`📊 Dodano: ${data.inserted || 0} ustaw`)
        addLog(`🔄 Zaktualizowano: ${data.updated || 0} ustaw`)
        if (!isAutomatic) {
          toast.success('Dane zostały zsynchronizowane')
        }
      } else {
        addLog(`❌ Błąd: ${data.message}`)
        if (!isAutomatic) {
          toast.error(data.message)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nieznany błąd'
      addLog(`❌ Błąd synchronizacji: ${message}`)
      setResult({ success: false, message })
      if (!isAutomatic) {
        toast.error('Błąd synchronizacji')
      }
    } finally {
      setIsSyncing(false)
    }
  }, [addLog])

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setAutoSync(settings)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(autoSync))
  }, [autoSync])

  // Auto-sync timer
  useEffect(() => {
    if (!autoSync.enabled) {
      setNextSyncIn(null)
      return
    }

    let countdown = autoSync.interval * 60 // Convert to seconds
    setNextSyncIn(countdown)

    const timer = setInterval(() => {
      countdown--
      setNextSyncIn(countdown)

      if (countdown <= 0) {
        syncData(true)
        countdown = autoSync.interval * 60
        setNextSyncIn(countdown)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [autoSync.enabled, autoSync.interval, syncData])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel Administracyjny</h1>
          <p className="text-muted-foreground mt-2">
            Synchronizacja danych z oficjalnego API Sejmu RP
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Synchronizacja bazy danych
            </CardTitle>
            <CardDescription>
              Pobierz najnowsze projekty ustaw z API Sejmu i zaktualizuj bazę danych.
              Dane są pobierane z <code className="bg-muted px-1 rounded">api.sejm.gov.pl</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => syncData(false)} 
                disabled={isSyncing}
                size="lg"
                className="gap-2"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Synchronizuję...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Synchronizuj dane
                  </>
                )}
              </Button>

              {result && (
                <Badge 
                  variant={result.success ? 'default' : 'destructive'}
                  className="gap-1"
                >
                  {result.success ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {result.success ? 'Sukces' : 'Błąd'}
                </Badge>
              )}
            </div>

            {logs.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Logi:</h3>
                <ScrollArea className="h-48 rounded-md border p-4 bg-muted/50">
                  <div className="space-y-1 font-mono text-sm">
                    {logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {result?.errors && result.errors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-destructive">Błędy:</h3>
                <ScrollArea className="h-32 rounded-md border border-destructive/50 p-4 bg-destructive/10">
                  <div className="space-y-1 font-mono text-sm text-destructive">
                    {result.errors.map((error, i) => (
                      <div key={i}>{error}</div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto-sync Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Automatyczna synchronizacja
            </CardTitle>
            <CardDescription>
              Włącz automatyczne pobieranie danych w określonych odstępach czasu.
              Ustawienia są zapisywane w przeglądarce.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Włącz automatyczną synchronizację</Label>
                <p className="text-sm text-muted-foreground">
                  Dane będą pobierane automatycznie w tle
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync.enabled}
                onCheckedChange={(checked) => setAutoSync(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="interval">Interwał synchronizacji:</Label>
              <Select
                value={String(autoSync.interval)}
                onValueChange={(value) => setAutoSync(prev => ({ ...prev, interval: parseInt(value) }))}
                disabled={!autoSync.enabled}
              >
                <SelectTrigger className="w-[180px]" id="interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Co 5 minut</SelectItem>
                  <SelectItem value="15">Co 15 minut</SelectItem>
                  <SelectItem value="30">Co 30 minut</SelectItem>
                  <SelectItem value="60">Co godzinę</SelectItem>
                  <SelectItem value="120">Co 2 godziny</SelectItem>
                  <SelectItem value="360">Co 6 godzin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {autoSync.enabled && (
              <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
                {nextSyncIn !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Następna synchronizacja za: <strong>{formatCountdown(nextSyncIn)}</strong>
                    </span>
                  </div>
                )}
                {lastSyncTime && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      Ostatnia: {lastSyncTime.toLocaleTimeString('pl-PL')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informacje o API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Źródło danych:</span>
                <a 
                  href="https://api.sejm.gov.pl/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  api.sejm.gov.pl
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kadencja:</span>
                <span>X (2023-obecnie)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endpoint:</span>
                <code className="bg-muted px-1 rounded">/sejm/term10/processes</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
