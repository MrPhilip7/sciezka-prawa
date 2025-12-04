'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Moon, Shield, Sun, Monitor, EyeOff, Settings, Lock } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { AccessibilityPanel } from '@/components/accessibility'

interface SettingsContentProps {
  isLoggedIn?: boolean
}

export function SettingsContent({ isLoggedIn = false }: SettingsContentProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'general'

  const isDarkMode = resolvedTheme === 'dark'

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
                <Button variant="destructive" size="sm">
                  Usuń konto
                </Button>
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
