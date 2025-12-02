'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Settings,
  ArrowLeft,
  RefreshCw,
  Shield,
  Users,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import type { SystemSetting } from '@/types/supabase'

interface SettingsContentProps {
  settings: SystemSetting[]
}

const settingsConfig: Record<string, {
  label: string
  description: string
  icon: React.ReactNode
  type: 'boolean' | 'number' | 'string'
}> = {
  auto_sync_enabled: {
    label: 'Automatyczna synchronizacja',
    description: 'Włącz automatyczne pobieranie danych z API Sejmu',
    icon: <RefreshCw className="h-5 w-5" />,
    type: 'boolean',
  },
  auto_sync_interval: {
    label: 'Interwał synchronizacji (minuty)',
    description: 'Co ile minut system ma automatycznie pobierać dane',
    icon: <Clock className="h-5 w-5" />,
    type: 'number',
  },
  maintenance_mode: {
    label: 'Tryb konserwacji',
    description: 'Wyłącz dostęp do aplikacji dla zwykłych użytkowników',
    icon: <Shield className="h-5 w-5" />,
    type: 'boolean',
  },
  registration_enabled: {
    label: 'Rejestracja użytkowników',
    description: 'Pozwól nowym użytkownikom na rejestrację',
    icon: <Users className="h-5 w-5" />,
    type: 'boolean',
  },
}

export function SettingsContent({ settings }: SettingsContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [localSettings, setLocalSettings] = useState<Record<string, string | boolean | number>>(
    Object.fromEntries(settings.map(s => [s.key, parseValue(s.value)]))
  )

  function parseValue(value: unknown): string | boolean | number {
    if (typeof value === 'string') {
      if (value === 'true') return true
      if (value === 'false') return false
      const num = Number(value)
      if (!isNaN(num)) return num
      return value
    }
    if (typeof value === 'boolean' || typeof value === 'number') return value
    return String(value)
  }

  const updateSetting = async (key: string, value: string | boolean | number) => {
    setIsLoading(key)
    setLocalSettings(prev => ({ ...prev, [key]: value }))

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: String(value) }),
      })

      if (!response.ok) throw new Error('Failed to update setting')

      toast.success('Ustawienie zostało zapisane')
      router.refresh()
    } catch (error) {
      toast.error('Wystąpił błąd podczas zapisywania')
      // Revert on error
      const original = settings.find(s => s.key === key)
      if (original) {
        setLocalSettings(prev => ({ ...prev, [key]: parseValue(original.value) }))
      }
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Ustawienia systemowe
          </h2>
          <p className="text-muted-foreground">
            Konfiguracja globalnych ustawień aplikacji
          </p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6">
        {Object.entries(settingsConfig).map(([key, config]) => {
          const currentValue = localSettings[key]
          const isLoadingThis = isLoading === key
          
          return (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {config.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  
                  {config.type === 'boolean' && (
                    <Switch
                      checked={currentValue === true}
                      disabled={isLoadingThis}
                      onCheckedChange={(checked) => updateSetting(key, checked)}
                    />
                  )}
                </div>
              </CardHeader>
              
              {config.type === 'number' && (
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor={key} className="min-w-[100px]">Wartość:</Label>
                    <Input
                      id={key}
                      type="number"
                      value={currentValue as number}
                      disabled={isLoadingThis}
                      className="w-[120px]"
                      onChange={(e) => setLocalSettings(prev => ({ 
                        ...prev, 
                        [key]: parseInt(e.target.value) || 0 
                      }))}
                      onBlur={(e) => {
                        const newValue = parseInt(e.target.value) || 0
                        if (newValue !== parseValue(settings.find(s => s.key === key)?.value)) {
                          updateSetting(key, newValue)
                        }
                      }}
                    />
                  </div>
                </CardContent>
              )}
              
              {config.type === 'string' && (
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor={key} className="min-w-[100px]">Wartość:</Label>
                    <Input
                      id={key}
                      value={currentValue as string}
                      disabled={isLoadingThis}
                      className="max-w-md"
                      onChange={(e) => setLocalSettings(prev => ({ 
                        ...prev, 
                        [key]: e.target.value 
                      }))}
                      onBlur={(e) => {
                        const original = settings.find(s => s.key === key)
                        if (e.target.value !== parseValue(original?.value)) {
                          updateSetting(key, e.target.value)
                        }
                      }}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Informacje o ustawieniach</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Zmiany w ustawieniach są zapisywane automatycznie i logowane w dzienniku aktywności.
                Niektóre ustawienia mogą wymagać ponownego uruchomienia serwera.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
