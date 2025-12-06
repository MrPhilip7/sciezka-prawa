'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Mail, Smartphone, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AlertButtonProps {
  billId: string
  billTitle: string
  variant?: 'default' | 'icon-only'
}

export function AlertButton({ billId, billTitle, variant = 'default' }: AlertButtonProps) {
  const [isAlertActive, setIsAlertActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyPush, setNotifyPush] = useState(false)

  useEffect(() => {
    checkAlertStatus()
  }, [billId])

  async function checkAlertStatus() {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) return

      const data = await response.json()
      const alert = data.alerts?.find((a: any) => a.bill_id === billId)
      
      if (alert) {
        setIsAlertActive(true)
        setNotifyEmail(alert.notify_email)
        setNotifyPush(alert.notify_push)
      }
    } catch (error) {
      console.error('Error checking alert status:', error)
    }
  }

  async function toggleAlert() {
    if (isAlertActive) {
      await removeAlert()
    } else {
      if (variant === 'default') {
        setShowOptions(true)
      } else {
        await createAlert()
      }
    }
  }

  async function createAlert() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          notifyEmail,
          notifyPush,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create alert')
      }

      setIsAlertActive(true)
      setShowOptions(false)
      toast.success('Alert został utworzony', {
        description: `Będziesz otrzymywać powiadomienia o: ${billTitle}`,
      })
    } catch (error: any) {
      toast.error('Nie udało się utworzyć alertu', {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function removeAlert() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/alerts?billId=${billId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove alert')
      }

      setIsAlertActive(false)
      toast.info('Alert został usunięty', {
        description: 'Nie będziesz już otrzymywać powiadomień',
      })
    } catch (error: any) {
      toast.error('Nie udało się usunąć alertu', {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'icon-only') {
    return (
      <Button
        variant={isAlertActive ? 'default' : 'outline'}
        size="icon"
        onClick={toggleAlert}
        disabled={isLoading}
        className="relative"
      >
        {isAlertActive ? (
          <Bell className="h-4 w-4 fill-current" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </Button>
    )
  }

  if (showOptions) {
    return (
      <div className="space-y-3 p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Ustawienia alertu</h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOptions(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="rounded"
            />
            <Mail className="h-4 w-4" />
            <span className="text-sm">Powiadomienia email</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyPush}
              onChange={(e) => setNotifyPush(e.target.checked)}
              className="rounded"
            />
            <Smartphone className="h-4 w-4" />
            <span className="text-sm">Powiadomienia push</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={createAlert}
            disabled={isLoading || (!notifyEmail && !notifyPush)}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Utwórz alert
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowOptions(false)}
            disabled={isLoading}
          >
            Anuluj
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant={isAlertActive ? 'default' : 'outline'}
      onClick={toggleAlert}
      disabled={isLoading}
      className="gap-2"
    >
      {isAlertActive ? (
        <>
          <Bell className="h-4 w-4 fill-current" />
          Alert aktywny
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          Ustaw alert
        </>
      )}
    </Button>
  )
}
