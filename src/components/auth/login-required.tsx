'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, LogIn, UserPlus } from 'lucide-react'

interface LoginRequiredProps {
  title?: string
  description?: string
}

export function LoginRequired({ 
  title = "Wymagane logowanie",
  description = "Zaloguj się, aby uzyskać dostęp do tej funkcji"
}: LoginRequiredProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full gap-2" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Zaloguj się
            </Link>
          </Button>
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link href="/register">
              <UserPlus className="h-4 w-4" />
              Utwórz konto
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
