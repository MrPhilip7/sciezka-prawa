import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Bell, Mail, Moon, Shield } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <DashboardLayout user={user}>
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
                <Moon className="h-5 w-5 text-primary" />
                <CardTitle>Wygląd</CardTitle>
              </div>
              <CardDescription>
                Dostosuj wygląd aplikacji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tryb ciemny</Label>
                  <p className="text-sm text-muted-foreground">
                    Przełącz między jasnym a ciemnym motywem
                  </p>
                </div>
                <Switch />
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
    </DashboardLayout>
  )
}
