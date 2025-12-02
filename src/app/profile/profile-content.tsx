'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  Bookmark,
  Calendar,
  Mail,
  User as UserIcon,
  Loader2,
  Save,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile } from '@/types/supabase'

interface ProfileContentProps {
  user: User
  profile: Profile | null
  stats: {
    alertsCount: number
    savedSearchesCount: number
  }
}

export function ProfileContent({ user, profile, stats }: ProfileContentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || user.user_metadata?.full_name || '')

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email?.slice(0, 2).toUpperCase() || 'U'
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      if (userError) throw userError

      toast.success('Profil został zaktualizowany')
    } catch (error) {
      toast.error('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profil</h2>
        <p className="text-muted-foreground">
          Zarządzaj swoimi danymi i preferencjami
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dane osobowe</CardTitle>
            <CardDescription>
              Zaktualizuj swoje dane profilowe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt={fullName || user.email || 'User'}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(fullName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{fullName || 'Użytkownik'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Separator />

              {/* Form fields */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Imię i nazwisko</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jan Kowalski"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email nie może być zmieniony
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Zapisz zmiany
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statystyki</CardTitle>
              <CardDescription>
                Twoja aktywność na platformie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{stats.alertsCount}</p>
                  <p className="text-sm text-muted-foreground">Aktywnych alertów</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bookmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{stats.savedSearchesCount}</p>
                  <p className="text-sm text-muted-foreground">Zapisanych wyszukiwań</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konto</CardTitle>
              <CardDescription>
                Informacje o koncie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data rejestracji</p>
                  <p className="font-medium">
                    {format(new Date(user.created_at), 'd MMMM yyyy', { locale: pl })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
