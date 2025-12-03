'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/components/theme-provider'
import { SidebarAccessibilityButton } from '@/components/accessibility/sidebar-accessibility-button'
import {
  LayoutDashboard,
  FileText,
  Bell,
  Search,
  Bookmark,
  Settings,
  HelpCircle,
  Scale,
  Sun,
  Moon,
  Monitor,
  Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const navigation = [
  {
    name: 'Panel',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Ustawy',
    href: '/bills',
    icon: FileText,
  },
  {
    name: 'Kalendarz',
    href: '/calendar',
    icon: Calendar,
    badge: 'Nowy',
  },
  {
    name: 'Wyszukiwarka',
    href: '/search',
    icon: Search,
    badge: 'AI',
  },
  {
    name: 'Powiadomienia',
    href: '/alerts',
    icon: Bell,
  },
  {
    name: 'Zapisane',
    href: '/saved',
    icon: Bookmark,
  },
]

const secondaryNavigation = [
  {
    name: 'Ustawienia',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Pomoc',
    href: '/help',
    icon: HelpCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Scale className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-lg">Ścieżka Prawa</span>
          <span className="text-xs text-muted-foreground">Śledzenie legislacji</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 px-3">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Więcej
          </p>
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t space-y-4">
        {/* Accessibility Button with floating panel */}
        <SidebarAccessibilityButton />
        
        {/* Theme Switcher */}
        <div className="flex items-center justify-between gap-1 p-1 rounded-lg bg-muted">
          <Button
            variant={theme === 'light' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('light')}
            className="flex-1 h-8"
            title="Jasny motyw"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === 'dark' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="flex-1 h-8"
            title="Ciemny motyw"
          >
            <Moon className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === 'system' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
            className="flex-1 h-8"
            title="Systemowy motyw"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>

        {/* Help card */}
        <div className="p-4 rounded-lg bg-primary/5">
          <p className="text-sm font-medium">Potrzebujesz pomocy?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sprawdź nasz przewodnik po procesie legislacyjnym
          </p>
          <Button variant="link" className="p-0 h-auto mt-2 text-primary" asChild>
            <Link href="/help">Dowiedz się więcej →</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
