'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface AccessibilitySettings {
  // Wizualne
  contrastMode: 'none' | 'inverted' | 'high-contrast-dark' | 'high-contrast-light'
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  fontSize: 'normal' | 'large' | 'xlarge' | 'xxlarge'
  underlineLinks: boolean
  reduceAnimations: boolean
  
  // Kognitywne
  focusMode: boolean
  simplifiedLanguage: boolean
  
  // Motoryczne
  largerClickTargets: boolean
  
  // Dysleksja
  dyslexicFont: boolean
  increasedSpacing: boolean
}

const defaultSettings: AccessibilitySettings = {
  contrastMode: 'none',
  colorBlindMode: 'none',
  fontSize: 'normal',
  underlineLinks: false,
  reduceAnimations: false,
  focusMode: false,
  simplifiedLanguage: false,
  largerClickTargets: false,
  dyslexicFont: false,
  increasedSpacing: false,
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void
  resetSettings: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (e) {
        console.error('Failed to parse accessibility settings', e)
      }
    }
    setMounted(true)
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    }
  }, [settings, mounted])

  // Apply accessibility classes to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const body = document.body

    // Contrast modes - apply to both html and body for proper cascading
    const contrastClasses = ['contrast-inverted', 'contrast-high-dark', 'contrast-high-light']
    contrastClasses.forEach(cls => {
      root.classList.remove(cls)
      body.classList.remove(cls)
    })
    
    if (settings.contrastMode === 'inverted') {
      root.classList.add('contrast-inverted')
      body.classList.add('contrast-inverted')
    } else if (settings.contrastMode === 'high-contrast-dark') {
      root.classList.add('contrast-high-dark')
      body.classList.add('contrast-high-dark')
    } else if (settings.contrastMode === 'high-contrast-light') {
      root.classList.add('contrast-high-light')
      body.classList.add('contrast-high-light')
    }

    // Color blind modes
    root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia')
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${settings.colorBlindMode}`)
    }

    // Font size
    root.classList.remove('font-size-large', 'font-size-xlarge', 'font-size-xxlarge')
    if (settings.fontSize !== 'normal') {
      root.classList.add(`font-size-${settings.fontSize}`)
    }

    // Underline links
    root.classList.toggle('underline-links', settings.underlineLinks)

    // Reduce animations
    root.classList.toggle('reduce-animations', settings.reduceAnimations)

    // Focus mode
    root.classList.toggle('focus-mode', settings.focusMode)

    // Larger click targets
    root.classList.toggle('larger-targets', settings.largerClickTargets)

    // Dyslexic font
    root.classList.toggle('dyslexic-font', settings.dyslexicFont)

    // Increased spacing
    root.classList.toggle('increased-spacing', settings.increasedSpacing)

  }, [settings, mounted])

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  )
}
