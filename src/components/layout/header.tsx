'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Menu,
  Search,
  LogOut,
  User as UserIcon,
  Settings,
  Scale,
} from 'lucide-react'
import { signout } from '@/app/auth/actions'

interface HeaderProps {
  user: User | null
  onMenuClick?: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Panel'
    if (pathname.startsWith('/bills')) return 'Ustawy'
    if (pathname.startsWith('/search')) return 'Wyszukiwarka'
    if (pathname.startsWith('/alerts')) return 'Powiadomienia'
    if (pathname.startsWith('/saved')) return 'Zapisane'
    if (pathname.startsWith('/profile')) return 'Profil'
    if (pathname.startsWith('/settings')) return 'Ustawienia'
    return 'Ścieżka Prawa'
  }

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email?.slice(0, 2).toUpperCase() || 'U'
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Mobile logo */}
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Scale className="h-6 w-6 text-primary" />
          <span className="font-semibold">Ścieżka Prawa</span>
        </Link>

        {/* Page title - desktop only */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 flex justify-center max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szukaj ustaw..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-muted/50"
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/alerts">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Powiadomienia</span>
                </Link>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.full_name || user.email || 'User'}
                      />
                      <AvatarFallback>
                        {getInitials(user.user_metadata?.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || 'Użytkownik'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Ustawienia
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => signout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Zaloguj się</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Zarejestruj się</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
