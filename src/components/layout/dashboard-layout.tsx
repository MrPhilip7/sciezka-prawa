'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileNav } from './mobile-nav'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User | null
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header user={user} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t bg-card mt-8 py-6">
          <div className="container max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Ścieżka Prawa. Wszelkie prawa zastrzeżone.
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <a href="/policies/terms" className="hover:text-foreground transition-colors">
                  Regulamin
                </a>
                <a href="/policies/privacy" className="hover:text-foreground transition-colors">
                  Polityka prywatności
                </a>
                <a href="/policies/accessibility" className="hover:text-foreground transition-colors">
                  Dostępność
                </a>
                <a href="/help" className="hover:text-foreground transition-colors">
                  Pomoc
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
