'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
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
  X,
  Shield,
  Calendar,
} from 'lucide-react'

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
  },
  {
    name: 'Wyszukiwarka',
    href: '/search',
    icon: Search,
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

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  
  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0">
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Ścieżka Prawa</span>
              <span className="text-xs text-muted-foreground">Śledzenie legislacji</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.name} href={item.href} onClick={onClose}>
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

          <div className="mt-8 px-3">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Więcej
            </p>
            <nav className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link key={item.name} href={item.href} onClick={onClose}>
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
                <Link href="/admin" onClick={onClose}>
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
      </SheetContent>
    </Sheet>
  )
}
