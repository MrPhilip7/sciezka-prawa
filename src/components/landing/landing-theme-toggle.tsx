'use client'

import { ThemeToggle } from '@/components/ui/theme-toggle'

export function LandingThemeToggle() {
  return (
    <ThemeToggle className="h-8 w-8 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80" />
  )
}
