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
      </div>
    </div>
  )
}
