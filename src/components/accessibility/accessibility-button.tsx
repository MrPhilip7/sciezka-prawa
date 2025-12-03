'use client'

import { useState } from 'react'
import { useAccessibility } from '@/components/providers/accessibility-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { 
  Accessibility, 
  X, 
  Contrast, 
  Type, 
  Sparkles,
  Focus,
  BookOpen,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSetting } = useAccessibility()

  // Sprawdź czy jakiekolwiek ustawienie jest aktywne
  const hasActiveSettings = 
    settings.contrastMode !== 'none' ||
    settings.colorBlindMode !== 'none' ||
    settings.fontSize !== 'normal' ||
    settings.underlineLinks ||
    settings.reduceAnimations ||
    settings.focusMode ||
    settings.largerClickTargets ||
    settings.dyslexicFont ||
    settings.increasedSpacing

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-lg transition-all accessibility-panel-button",
          "bg-zinc-900 border-2 hover:scale-110",
          hasActiveSettings 
            ? "border-blue-500 ring-2 ring-blue-500/20" 
            : "border-zinc-600 hover:border-blue-500"
        )}
        aria-label="Otwórz ułatwienia dostępu"
        title="Ułatwienia dostępu"
      >
        <Accessibility className={cn(
          "h-6 w-6 text-white",
          hasActiveSettings && "text-blue-400"
        )} />
        {hasActiveSettings && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
        )}
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 left-6 z-50 w-[340px] shadow-2xl accessibility-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Accessibility className="h-5 w-5 text-primary" />
            Ułatwienia dostępu
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Szybkie przełączniki */}
        <div className="space-y-3">
          {/* Tryb kontrastu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="quick-contrast" className="text-sm">
                Kontrast
              </Label>
            </div>
            <Select
              value={settings.contrastMode}
              onValueChange={(value) => updateSetting('contrastMode', value as 'none' | 'inverted' | 'high-contrast-dark' | 'high-contrast-light')}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs" id="quick-contrast">
                <SelectValue placeholder="Wybierz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Wyłączony</SelectItem>
                <SelectItem value="inverted">Odwrócone</SelectItem>
                <SelectItem value="high-contrast-dark">Wysoki (ciemny)</SelectItem>
                <SelectItem value="high-contrast-light">Wysoki (jasny)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Większy tekst */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="quick-font" className="text-sm cursor-pointer">
                Większy tekst
              </Label>
            </div>
            <Switch
              id="quick-font"
              checked={settings.fontSize !== 'normal'}
              onCheckedChange={(checked) => updateSetting('fontSize', checked ? 'large' : 'normal')}
            />
          </div>

          {/* Redukcja animacji */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="quick-animations" className="text-sm cursor-pointer">
                Bez animacji
              </Label>
            </div>
            <Switch
              id="quick-animations"
              checked={settings.reduceAnimations}
              onCheckedChange={(checked) => updateSetting('reduceAnimations', checked)}
            />
          </div>

          {/* Tryb skupienia */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Focus className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="quick-focus" className="text-sm cursor-pointer">
                Tryb skupienia
              </Label>
            </div>
            <Switch
              id="quick-focus"
              checked={settings.focusMode}
              onCheckedChange={(checked) => updateSetting('focusMode', checked)}
            />
          </div>

          {/* Czcionka dla dysleksji */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="quick-dyslexic" className="text-sm cursor-pointer">
                Czcionka dla dysleksji
              </Label>
            </div>
            <Switch
              id="quick-dyslexic"
              checked={settings.dyslexicFont}
              onCheckedChange={(checked) => updateSetting('dyslexicFont', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Link do pełnych ustawień */}
        <Link 
          href="/settings?tab=accessibility"
          className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <span className="text-sm font-medium">Wszystkie ustawienia dostępności</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  )
}
