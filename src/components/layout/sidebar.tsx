'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/components/theme-provider'
import { SidebarAccessibilityButton } from '@/components/accessibility/sidebar-accessibility-button'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/supabase'
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
  Shield,
  Lock,
  MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// Items available to everyone
const publicNavigation = [
  {
    name: 'Panel',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiresAuth: false,
  },
  {
    name: 'Ustawy',
    href: '/bills',
    icon: FileText,
    requiresAuth: false,
  },
  {
    name: 'Kalendarz',
    href: '/calendar',
    icon: Calendar,
    requiresAuth: false,
  },
]

// Items that require login
const authRequiredNavigation = [
  {
    name: 'Wyszukiwarka',
    href: '/search',
    icon: Search,
    badge: 'AI',
    requiresAuth: true,
  },
  {
    name: 'Konsultacje',
    href: '/consultations',
    icon: MessageSquare,
    badge: 'Nowy',
    requiresAuth: true,
  },
  {
    name: 'Powiadomienia',
    href: '/alerts',
    icon: Bell,
    requiresAuth: true,
  },
  {
    name: 'Zapisane',
    href: '/saved',
    icon: Bookmark,
    requiresAuth: true,
  },
]

const secondaryNavigation = [
  {
    name: 'Ustawienia',
    href: '/settings',
    icon: Settings,
    requiresAuth: false,
  },
  {
    name: 'Pomoc',
    href: '/help',
    icon: HelpCircle,
    requiresAuth: false,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  
  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      setIsLoggedIn(!!user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role) {
          setUserRole(profile.role as UserRole)
        }
      }
    }
    
    fetchUserRole()
  }, [])
  
  const isAdmin = userRole === 'admin' || userRole === 'super_admin'
  
  // Handle click on auth-required items when not logged in
  const handleAuthRequiredClick = (e: React.MouseEvent, itemName: string) => {
    if (isLoggedIn === false) {
      e.preventDefault()
      toast.info(`Funkcja "${itemName}" wymaga zalogowania`, {
        description: 'Zaloguj się, aby uzyskać dostęp do wszystkich funkcji.',
        action: {
          label: 'Zaloguj się',
          onClick: () => router.push('/login')
        }
      })
    }
  }
  
  // Combine navigation items
  const navigation = [...publicNavigation, ...authRequiredNavigation]

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
            const isDisabled = item.requiresAuth && isLoggedIn === false
            
            return (
              <Link 
                key={item.name} 
                href={isDisabled ? '#' : item.href}
                onClick={(e) => item.requiresAuth && handleAuthRequiredClick(e, item.name)}
              >
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15',
                    isDisabled && 'opacity-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isDisabled ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : item.badge ? (
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      {item.badge}
                    </Badge>
                  ) : null}
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
        
        {/* Admin Panel - only visible for admin and super_admin */}
        {isAdmin && (
          <div className="mt-8 px-3">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Administracja
            </p>
            <nav className="space-y-1">
              <Link href="/admin">
                <Button
                  variant={pathname.startsWith('/admin') ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    pathname.startsWith('/admin') && 'bg-primary/10 text-primary hover:bg-primary/15'
                  )}
                >
                  <Shield className="h-5 w-5" />
                  <span className="flex-1 text-left">Panel admina</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                    Admin
                  </Badge>
                </Button>
              </Link>
            </nav>
          </div>
        )}
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
