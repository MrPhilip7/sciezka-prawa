'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, CheckCheck, Trash2, X, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: {
    link?: string
    action?: string
    billId?: string
    [key: string]: unknown
  }
  is_read: boolean
  created_at: string
}

interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=10')
      if (!response.ok) {
        if (response.status === 401) {
          // User not logged in - hide notifications
          setNotifications([])
          setUnreadCount(0)
          return
        }
        throw new Error('Failed to fetch')
      }
      const data: NotificationsResponse = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        const deleted = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (deleted && !deleted.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bill_change':
        return '📋'
      case 'consultation_start':
        return '🗣️'
      case 'consultation_end':
        return '⏰'
      case 'alert_created':
        return '🔔'
      case 'digest':
        return '📊'
      case 'welcome':
        return '👋'
      default:
        return '📌'
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.data?.link) return notification.data.link
    if (notification.data?.billId) return `/bills/${notification.data.billId}`
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Powiadomienia${unreadCount > 0 ? ` (${unreadCount} nieprzeczytanych)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Powiadomienia</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Oznacz wszystkie
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Brak powiadomień
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ustaw alerty dla ustaw, aby otrzymywać powiadomienia
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const link = getNotificationLink(notification)
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-muted/50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${
                            !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsRead(notification.id)}
                                title="Oznacz jako przeczytane"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                              title="Usuń"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: pl,
                            })}
                          </span>
                          {link && (
                            <Link
                              href={link}
                              onClick={() => {
                                if (!notification.is_read) {
                                  markAsRead(notification.id)
                                }
                                setOpen(false)
                              }}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              Zobacz
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Link
              href="/alerts"
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:underline"
            >
              Zarządzaj alertami →
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Standalone notification list component for alerts page
export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const limit = 20

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?limit=${limit}&offset=${page * limit}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data: NotificationsResponse = await response.json()
      setNotifications(data.notifications)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const deleteAll = async () => {
    if (!confirm('Czy na pewno chcesz usunąć wszystkie powiadomienia?')) return
    
    try {
      const response = await fetch('/api/notifications?all=true', {
        method: 'DELETE',
      })
      if (response.ok) {
        setNotifications([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Brak powiadomień</h3>
        <p className="text-muted-foreground">
          Twoja historia powiadomień jest pusta.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {total} powiadomień
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={deleteAll}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Usuń wszystkie
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              !notification.is_read 
                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                : 'bg-card'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {notification.type === 'bill_change' ? '📋' :
                 notification.type === 'consultation_start' ? '🗣️' :
                 notification.type === 'welcome' ? '👋' : '📌'}
              </span>
              <div className="flex-1">
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: pl,
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {total > limit && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            Strona {page + 1} z {Math.ceil(total / limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * limit >= total}
          >
            Następna
          </Button>
        </div>
      )}
    </div>
  )
}
