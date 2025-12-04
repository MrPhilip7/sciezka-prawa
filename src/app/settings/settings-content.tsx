'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Bell, Moon, Shield, Sun, Monitor, EyeOff, Settings, Lock, Loader2, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { AccessibilityPanel } from '@/components/accessibility'
import { toast } from 'sonner'

interface SettingsContentProps {
  isLoggedIn?: boolean
}

export function SettingsContent({ isLoggedIn = false }: SettingsContentProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultTab = searchParams.get('tab') || 'general'
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isDarkMode = resolvedTheme === 'dark'

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'USUŃ KONTO') {
      toast.error('Wpisz "USUŃ KONTO" aby potwierdzić')
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas usuwania konta')
      }
      
      toast.success('Konto zostało usunięte')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Wystąpił błąd podczas usuwania konta')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmation('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ustawienia</h2>
        <p className="text-muted-foreground">
          {isLoggedIn 
            ? 'Zarządzaj ustawieniami swojego konta i preferencjami'
            : 'Dostosuj wygląd i dostępność aplikacji'
          }
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            Ogólne
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="gap-2">
            <EyeOff className="h-4 w-4" />
            Dostępność
          </TabsTrigger>
        </TabsList>

        {/* Zakładka: Ogólne */}
        <TabsContent value="general" className="space-y-6">
        
        {/* Notifications Settings - only for logged in users */}
        {isLoggedIn ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Powiadomienia</CardTitle>
              </div>
              <CardDescription>
                Skonfiguruj sposób otrzymywania powiadomień
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Powiadomienia email</Label>
                  <p className="text-sm text-muted-foreground">
                    Otrzymuj powiadomienia o zmianach na email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Codzienny raport</Label>
                  <p className="text-sm text-muted-foreground">
                    Otrzymuj codzienne podsumowanie zmian
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nowe projekty ustaw</Label>
                  <p className="text-sm text-muted-foreground">
                    Powiadamiaj o nowych projektach ustaw
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="opacity-75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-muted-foreground">Powiadomienia</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
              <CardDescription>
                Zaloguj się, aby skonfigurować powiadomienia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/login">Zaloguj się</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
              <CardTitle>Wygląd</CardTitle>
            </div>
            <CardDescription>
              Dostosuj wygląd aplikacji
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Wybierz motyw</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Jasny
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Ciemny
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Systemowy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings - only for logged in users */}
        {isLoggedIn ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Prywatność</CardTitle>
              </div>
              <CardDescription>
                Zarządzaj ustawieniami prywatności
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profil publiczny</Label>
                  <p className="text-sm text-muted-foreground">
                    Pozwól innym użytkownikom zobaczyć Twój profil
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Statystyki aktywności</Label>
                  <p className="text-sm text-muted-foreground">
                    Pokaż Twoje statystyki na profilu
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Danger Zone - only for logged in users */}
        {isLoggedIn ? (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Strefa zagrożenia</CardTitle>
              <CardDescription>
                Nieodwracalne akcje związane z kontem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Usuń konto</Label>
                  <p className="text-sm text-muted-foreground">
                    Trwale usuń swoje konto i wszystkie dane
                  </p>
                </div>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Usuń konto
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Czy na pewno chcesz usunąć konto?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-4">
                        <p>
                          Ta operacja jest <strong>nieodwracalna</strong>. Wszystkie Twoje dane zostaną trwale usunięte:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Profil i dane osobowe</li>
                          <li>Zapisane wyszukiwania</li>
                          <li>Alerty i powiadomienia</li>
                          <li>Historia aktywności</li>
                        </ul>
                        <div className="pt-4">
                          <Label htmlFor="deleteConfirmation" className="text-foreground">
                            Wpisz <strong>USUŃ KONTO</strong> aby potwierdzić:
                          </Label>
                          <Input
                            id="deleteConfirmation"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="USUŃ KONTO"
                            className="mt-2"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                        Anuluj
                      </AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || deleteConfirmation !== 'USUŃ KONTO'}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Usuwanie...
                          </>
                        ) : (
                          'Usuń konto na zawsze'
                        )}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ) : null}
        </TabsContent>

        {/* Zakładka: Dostępność */}
        <TabsContent value="accessibility">
          <AccessibilityPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
