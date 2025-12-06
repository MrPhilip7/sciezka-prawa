'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function TestWelcomeNotificationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const sendTestNotification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/notifications/welcome', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Powiadomienie zostało utworzone!' })
      } else {
        setResult({ success: false, error: data.error || 'Wystąpił błąd' })
      }
    } catch (error) {
      setResult({ success: false, error: 'Nie udało się połączyć z API' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Test powiadomienia powitalnego
          </CardTitle>
          <CardDescription>
            Kliknij przycisk, aby wysłać testowe powiadomienie powitalne na swoje konto.
            Powiadomienie pojawi się w dzwonku w nagłówku.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Treść powiadomienia:</p>
            <div className="flex gap-3">
              <span className="text-2xl">👋</span>
              <div>
                <p className="font-medium">Witaj w Ścieżce Prawa!</p>
                <p className="text-sm text-muted-foreground">
                  Dziękujemy za rejestrację! Zapoznaj się z przewodnikiem, aby dowiedzieć się jak korzystać z aplikacji.
                </p>
                <p className="text-xs text-primary mt-1">→ Przekierowanie do /help</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={sendTestNotification} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Wyślij testowe powiadomienie
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? result.message : result.error}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Uwaga: Wymaga uprawnień administratora. Tabela notifications musi istnieć w bazie danych.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
