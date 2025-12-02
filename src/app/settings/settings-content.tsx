'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Bell, Moon, Shield, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function SettingsContent() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const isDarkMode = resolvedTheme === 'dark'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ustawienia</h2>
        <p className="text-muted-foreground">
          Zarządzaj ustawieniami swojego konta i preferencjami
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications Settings */}
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

        {/* Privacy Settings */}
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

        {/* Danger Zone */}
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
      </div>
    </div>
  )
}
