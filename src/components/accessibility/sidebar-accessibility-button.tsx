'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAccessibility } from '@/components/providers/accessibility-provider'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { 
  EyeOff, 
  X, 
  Contrast, 
  Type, 
  Sparkles,
  Focus,
  BookOpen,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export function SidebarAccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { settings, updateSetting } = useAccessibility()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const panel = isOpen && mounted ? createPortal(
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/30" 
        onClick={() => setIsOpen(false)}
      />
      {/* Panel */}
      <div 
        className="accessibility-panel fixed left-72 bottom-24 z-[9999] w-[340px] rounded-xl shadow-2xl border"
        style={{ backgroundColor: '#ffffff', color: '#1f1f1f', borderColor: '#e5e5e5' }}
      >
        <div className="p-4 border-b" style={{ borderColor: '#e5e5e5' }}>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold" style={{ color: '#1f1f1f' }}>
              <EyeOff className="h-5 w-5" style={{ color: '#3b82f6' }} />
              Ułatwienia dostępu
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Tryb kontrastu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4" style={{ color: '#6b7280' }} />
              <Label htmlFor="sidebar-contrast" className="text-sm" style={{ color: '#374151' }}>
                Kontrast
              </Label>
            </div>
            <Select
              value={settings.contrastMode}
              onValueChange={(value) => updateSetting('contrastMode', value as 'none' | 'inverted' | 'high-contrast-dark' | 'high-contrast-light')}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs" id="sidebar-contrast" style={{ backgroundColor: '#f3f4f6', color: '#1f1f1f', borderColor: '#d1d5db' }}>
                <SelectValue placeholder="Wybierz" />
              </SelectTrigger>
              <SelectContent className="z-[10000]" style={{ backgroundColor: '#ffffff', color: '#1f1f1f', borderColor: '#d1d5db' }}>
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
              <Type className="h-4 w-4" style={{ color: '#6b7280' }} />
              <Label htmlFor="sidebar-font" className="text-sm cursor-pointer" style={{ color: '#374151' }}>
                Większy tekst
              </Label>
            </div>
            <Switch
              id="sidebar-font"
              checked={settings.fontSize !== 'normal'}
              onCheckedChange={(checked) => updateSetting('fontSize', checked ? 'large' : 'normal')}
            />
          </div>

          {/* Redukcja animacji */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#6b7280' }} />
              <Label htmlFor="sidebar-animations" className="text-sm cursor-pointer" style={{ color: '#374151' }}>
                Bez animacji
              </Label>
            </div>
            <Switch
              id="sidebar-animations"
              checked={settings.reduceAnimations}
              onCheckedChange={(checked) => updateSetting('reduceAnimations', checked)}
            />
          </div>

          {/* Tryb skupienia */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Focus className="h-4 w-4" style={{ color: '#6b7280' }} />
              <Label htmlFor="sidebar-focus" className="text-sm cursor-pointer" style={{ color: '#374151' }}>
                Tryb skupienia
              </Label>
            </div>
            <Switch
              id="sidebar-focus"
              checked={settings.focusMode}
              onCheckedChange={(checked) => updateSetting('focusMode', checked)}
            />
          </div>

          {/* Czcionka dla dysleksji */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" style={{ color: '#6b7280' }} />
              <Label htmlFor="sidebar-dyslexic" className="text-sm cursor-pointer" style={{ color: '#374151' }}>
                Czcionka dla dysleksji
              </Label>
            </div>
            <Switch
              id="sidebar-dyslexic"
              checked={settings.dyslexicFont}
              onCheckedChange={(checked) => updateSetting('dyslexicFont', checked)}
            />
          </div>
        </div>

        <Separator style={{ backgroundColor: '#e5e5e5' }} />

        {/* Link do pełnych ustawień */}
        <div className="p-4">
          <Link 
            href="/settings?tab=accessibility"
            className="flex items-center justify-between p-3 -m-3 rounded-lg transition-colors"
            style={{ color: '#374151' }}
            onClick={() => setIsOpen(false)}
          >
            <span className="text-sm font-medium">Wszystkie ustawienia dostępności</span>
            <ChevronRight className="h-4 w-4" style={{ color: '#6b7280' }} />
          </Link>
        </div>
      </div>
    </>,
    document.body
  ) : null

  return (
    <div className="relative mt-3 flex justify-center">
      {/* Okrągły przycisk floating */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-3 rounded-full shadow-lg transition-all",
          "bg-zinc-900 border-2 hover:scale-110",
          hasActiveSettings 
            ? "border-blue-500 ring-2 ring-blue-500/20" 
            : "border-zinc-600 hover:border-blue-500"
        )}
        aria-label="Otwórz ułatwienia dostępu"
        title="Ułatwienia dostępu"
      >
        <EyeOff className={cn(
          "h-6 w-6 text-white",
          hasActiveSettings && "text-blue-400"
        )} />
        {hasActiveSettings && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
        )}
      </button>

      {panel}
    </div>
  )
}
