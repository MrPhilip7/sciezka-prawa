'use client'

import { useAccessibility, AccessibilitySettings } from '@/components/providers/accessibility-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Eye, 
  Type, 
  MousePointer, 
  Brain, 
  RotateCcw,
  Contrast,
  Palette,
  Underline,
  Sparkles,
  Focus,
  MessageSquare,
  Move,
  BookOpen,
  Space
} from 'lucide-react'

export function AccessibilityPanel() {
  const { settings, updateSetting, resetSettings } = useAccessibility()

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ułatwienia dostępu</h2>
          <p className="text-muted-foreground">
            Dostosuj aplikację do swoich potrzeb
          </p>
        </div>
        <Button variant="outline" onClick={resetSettings} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Resetuj ustawienia
        </Button>
      </div>

      {/* Sekcja: Wizualne */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Ustawienia wizualne
          </CardTitle>
          <CardDescription>
            Opcje dla osób z problemami wzroku
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tryb kontrastu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Contrast className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="contrast-mode" className="font-medium">Tryb kontrastu</Label>
                <p className="text-sm text-muted-foreground">
                  Zwiększony kontrast kolorów dla lepszej widoczności
                </p>
              </div>
            </div>
            <Select
              value={settings.contrastMode}
              onValueChange={(value) => updateSetting('contrastMode', value as AccessibilitySettings['contrastMode'])}
            >
              <SelectTrigger className="w-[220px]" id="contrast-mode">
                <SelectValue placeholder="Wybierz tryb" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Wyłączony</SelectItem>
                <SelectItem value="inverted">Odwrócone kolory</SelectItem>
                <SelectItem value="high-contrast-dark">Wysoki kontrast (ciemny)</SelectItem>
                <SelectItem value="high-contrast-light">Wysoki kontrast (jasny)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tryb daltonizmu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="colorblind-mode" className="font-medium">Tryb dla daltonistów</Label>
                <p className="text-sm text-muted-foreground">
                  Dostosowanie kolorów dla osób z zaburzeniami widzenia barw
                </p>
              </div>
            </div>
            <Select
              value={settings.colorBlindMode}
              onValueChange={(value) => updateSetting('colorBlindMode', value as AccessibilitySettings['colorBlindMode'])}
            >
              <SelectTrigger className="w-[180px]" id="colorblind-mode">
                <SelectValue placeholder="Wybierz tryb" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Wyłączony</SelectItem>
                <SelectItem value="protanopia">Protanopia (brak czerwonego)</SelectItem>
                <SelectItem value="deuteranopia">Deuteranopia (brak zielonego)</SelectItem>
                <SelectItem value="tritanopia">Tritanopia (brak niebieskiego)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Rozmiar czcionki */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="font-size" className="font-medium">Rozmiar tekstu</Label>
                <p className="text-sm text-muted-foreground">
                  Zwiększ rozmiar czcionki dla łatwiejszego czytania
                </p>
              </div>
            </div>
            <Select
              value={settings.fontSize}
              onValueChange={(value) => updateSetting('fontSize', value as AccessibilitySettings['fontSize'])}
            >
              <SelectTrigger className="w-[180px]" id="font-size">
                <SelectValue placeholder="Wybierz rozmiar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normalny (100%)</SelectItem>
                <SelectItem value="large">Duży (112%)</SelectItem>
                <SelectItem value="xlarge">Bardzo duży (125%)</SelectItem>
                <SelectItem value="xxlarge">Największy (150%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Podkreślone linki */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Underline className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="underline-links" className="font-medium">Podkreślone linki</Label>
                <p className="text-sm text-muted-foreground">
                  Zawsze pokazuj podkreślenie pod linkami
                </p>
              </div>
            </div>
            <Switch
              id="underline-links"
              checked={settings.underlineLinks}
              onCheckedChange={(checked) => updateSetting('underlineLinks', checked)}
            />
          </div>

          <Separator />

          {/* Redukcja animacji */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="reduce-animations" className="font-medium">Redukcja animacji</Label>
                <p className="text-sm text-muted-foreground">
                  Wyłącz animacje i efekty ruchu
                </p>
              </div>
            </div>
            <Switch
              id="reduce-animations"
              checked={settings.reduceAnimations}
              onCheckedChange={(checked) => updateSetting('reduceAnimations', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sekcja: Kognitywne */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Ułatwienia kognitywne
          </CardTitle>
          <CardDescription>
            Opcje dla osób z trudnościami w koncentracji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tryb skupienia */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Focus className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="focus-mode" className="font-medium">Tryb skupienia</Label>
                <p className="text-sm text-muted-foreground">
                  Przyciemnia elementy rozpraszające, podświetla treść główną
                </p>
              </div>
            </div>
            <Switch
              id="focus-mode"
              checked={settings.focusMode}
              onCheckedChange={(checked) => updateSetting('focusMode', checked)}
            />
          </div>

          <Separator />

          {/* Uproszczony język */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="simplified-language" className="font-medium">Uproszczony język</Label>
                <p className="text-sm text-muted-foreground">
                  Wyświetlaj prostsze opisy tam, gdzie to możliwe
                </p>
              </div>
            </div>
            <Switch
              id="simplified-language"
              checked={settings.simplifiedLanguage}
              onCheckedChange={(checked) => updateSetting('simplifiedLanguage', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sekcja: Motoryczne */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Ułatwienia motoryczne
          </CardTitle>
          <CardDescription>
            Opcje dla osób z ograniczoną sprawnością ruchową
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Większe cele klikania */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Move className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="larger-targets" className="font-medium">Większe przyciski</Label>
                <p className="text-sm text-muted-foreground">
                  Powiększone elementy interaktywne dla łatwiejszego klikania
                </p>
              </div>
            </div>
            <Switch
              id="larger-targets"
              checked={settings.largerClickTargets}
              onCheckedChange={(checked) => updateSetting('largerClickTargets', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sekcja: Dysleksja */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Ułatwienia dla dysleksji
          </CardTitle>
          <CardDescription>
            Opcje ułatwiające czytanie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Czcionka dla dyslektyków */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="dyslexic-font" className="font-medium">Czcionka OpenDyslexic</Label>
                <p className="text-sm text-muted-foreground">
                  Specjalna czcionka zaprojektowana dla osób z dysleksją
                </p>
              </div>
            </div>
            <Switch
              id="dyslexic-font"
              checked={settings.dyslexicFont}
              onCheckedChange={(checked) => updateSetting('dyslexicFont', checked)}
            />
          </div>

          <Separator />

          {/* Zwiększone odstępy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Space className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="increased-spacing" className="font-medium">Zwiększone odstępy</Label>
                <p className="text-sm text-muted-foreground">
                  Większe odstępy między literami i wierszami
                </p>
              </div>
            </div>
            <Switch
              id="increased-spacing"
              checked={settings.increasedSpacing}
              onCheckedChange={(checked) => updateSetting('increasedSpacing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informacja o skrótach klawiszowych */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h12" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Skróty klawiszowe</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Używaj klawisza <kbd className="px-2 py-0.5 bg-background rounded border text-xs">Tab</kbd> do nawigacji,{' '}
                <kbd className="px-2 py-0.5 bg-background rounded border text-xs">Enter</kbd> do aktywacji,{' '}
                <kbd className="px-2 py-0.5 bg-background rounded border text-xs">Escape</kbd> do zamykania okien dialogowych.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
