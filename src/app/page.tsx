import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Scale,
  Search,
  Bell,
  Clock,
  FileText,
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl">Ścieżka Prawa</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Funkcje
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                Jak to działa
              </Link>
              <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                O projekcie
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Zaloguj się</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Zarejestruj się</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" />
            Śledź proces legislacyjny w Polsce
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Bądź na bieżąco z{' '}
            <span className="text-primary">ustawami</span>{' '}
            w Polsce
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ścieżka Prawa to platforma umożliwiająca śledzenie procesu legislacyjnego w Polsce.
            Monitoruj projekty ustaw, otrzymuj powiadomienia i bądź świadomym obywatelem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/register">
                Rozpocznij za darmo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">
                Przeglądaj ustawy
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Wszystko czego potrzebujesz
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Nasza platforma oferuje kompletny zestaw narzędzi do śledzenia procesu legislacyjnego
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Aktualizacje w czasie rzeczywistym</CardTitle>
              <CardDescription>
                Automatyczne pobieranie danych z API Sejmu i systemu ELI zapewnia najświeższe informacje
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Zaawansowane wyszukiwanie</CardTitle>
              <CardDescription>
                Filtruj ustawy według statusu, ministerstwa, daty i wielu innych kryteriów
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Powiadomienia</CardTitle>
              <CardDescription>
                Otrzymuj alerty o zmianach w śledzonych projektach ustaw na email
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Interaktywna oś czasu</CardTitle>
              <CardDescription>
                Wizualizacja procesu legislacyjnego pokazuje dokładnie, na jakim etapie jest ustawa
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Bezpieczne konto</CardTitle>
              <CardDescription>
                Twoje dane są chronione dzięki bezpiecznej autoryzacji przez Supabase
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Dla każdego</CardTitle>
              <CardDescription>
                Obywatele, dziennikarze, prawnicy - każdy może śledzić proces legislacyjny
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-slate-50 dark:bg-slate-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Jak to działa?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trzy proste kroki do bycia na bieżąco z polskim prawodawstwem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Zarejestruj się</h3>
              <p className="text-muted-foreground">
                Utwórz bezpłatne konto, aby uzyskać dostęp do wszystkich funkcji platformy
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Wyszukaj ustawy</h3>
              <p className="text-muted-foreground">
                Przeglądaj projekty ustaw i znajdź te, które Cię interesują
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ustaw alerty</h3>
              <p className="text-muted-foreground">
                Dodaj powiadomienia i bądź informowany o każdej zmianie w projekcie
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Zacznij śledzić ustawy już dziś
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Dołącz do tysięcy obywateli, którzy są na bieżąco z polskim prawodawstwem.
              Rejestracja jest bezpłatna.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <Link href="/register">
                  Utwórz bezpłatne konto
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-xl">Ścieżka Prawa</span>
              </Link>
              <p className="text-muted-foreground max-w-md">
                Platforma umożliwiająca śledzenie procesu legislacyjnego w Polsce.
                Promujemy transparentność i świadome uczestnictwo obywateli w procesie tworzenia prawa.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Nawigacja</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/bills" className="hover:text-foreground transition-colors">
                    Ustawy
                  </Link>
                </li>
                <li>
                  <Link href="/alerts" className="hover:text-foreground transition-colors">
                    Powiadomienia
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Źródła danych</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a 
                    href="https://api.sejm.gov.pl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    API Sejmu RP
                  </a>
                </li>
                <li>
                  <a 
                    href="https://eli.gov.pl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    System ELI
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Ścieżka Prawa. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
