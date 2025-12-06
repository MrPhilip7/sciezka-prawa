import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { LandingBillsDemo } from '@/components/landing/landing-bills-demo'
import {
  Scale,
  Search,
  Bell,
  ArrowRight,
  Zap,
  GitPullRequest,
  Filter,
  Check,
  X,
  Plus,
  FileText,
  ExternalLink,
} from 'lucide-react'

// Fetch real bills for demo
async function getDemoData() {
  const supabase = await createClient()
  
  // Get bills with more fields
  const { data: bills } = await supabase
    .from('bills')
    .select('id, sejm_id, title, status, submission_date, last_updated, description, ministry')
    .order('last_updated', { ascending: false })
    .limit(20)
  
  // Get bills count by status
  const { data: statusCounts } = await supabase
    .from('bills')
    .select('status')
  
  const billsByStatus: Record<string, number> = {}
  statusCounts?.forEach((bill) => {
    billsByStatus[bill.status] = (billsByStatus[bill.status] || 0) + 1
  })
  
  return { bills: bills || [], billsByStatus }
}

export default async function HomePage() {
  const { bills, billsByStatus } = await getDemoData()
  
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background Glow Effects */}
      <div className="fixed top-[-200px] left-[-100px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">ŚCIEŻKA PRAWA</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Funkcje</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
            <a href="#about" className="hover:text-foreground transition-colors">O projekcie</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Zaloguj się
            </Link>
            <Button size="sm" asChild className="rounded-full text-xs h-8 px-4">
              <Link href="/register">Zarejestruj się</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Śledź proces legislacyjny w Polsce — za darmo!
          </div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent leading-[1.1]">
            Przejrzystość prawa<br />w Twoich rękach.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Platforma umożliwiająca śledzenie procesu legislacyjnego w Polsce. Monitoruj projekty ustaw, otrzymuj powiadomienia i bądź świadomym obywatelem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="rounded-full gap-2 h-10 px-6">
              <Link href="/dashboard">
                Rozpocznij bez logowania
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full gap-2 h-10 px-6">
              <Link href="/bills">
                <Search className="h-4 w-4" />
                Przeglądaj ustawy
              </Link>
            </Button>
          </div>
        </div>

        {/* UI Demo: Legislative Dashboard */}
        <div id="demo" className="max-w-6xl mx-auto mt-20 relative">
          <LandingBillsDemo bills={bills} billsByStatus={billsByStatus} />
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl border border-border bg-card/20 hover:bg-card/40 transition-all hover:border-border/80">
              <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center mb-6 text-foreground group-hover:text-primary transition-colors">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatyczne pobieranie danych z oficjalnego API Sejmu RP oraz systemu ELI. Bądź na bieżąco z każdą zmianą statusu projektu w momencie jej publikacji.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl border border-border bg-card/20 hover:bg-card/40 transition-all hover:border-border/80">
              <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center mb-6 text-foreground group-hover:text-emerald-500 transition-colors">
                <GitPullRequest className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Oś Czasu Legislacji</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Interaktywna wizualizacja ścieżki legislacyjnej. Od wpłynięcia projektu, przez czytania i komisje, aż do podpisu Prezydenta i publikacji w Dzienniku Ustaw.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl border border-border bg-card/20 hover:bg-card/40 transition-all hover:border-border/80">
              <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center mb-6 text-foreground group-hover:text-purple-500 transition-colors">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">System Powiadomień</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Skonfiguruj alerty email dla konkretnych słów kluczowych, ministerstw lub konkretnych projektów ustaw. Nie przegap kluczowych głosowań.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Section: Filtering */}
      <section className="py-24 border-t border-border bg-muted/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-6">
              <Filter className="h-3.5 w-3.5" />
              Zaawansowane Wyszukiwanie
            </div>
            <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-6 tracking-tight">Znajdź to, co naprawdę<br />ma znaczenie.</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-md">
              Przeszukuj tysiące dokumentów sejmowych z precyzją chirurga. Filtruj po statusie, wnioskodawcy, datach czy typie dokumentu. Zapisuj filtry na swoim profilu użytkownika.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-foreground">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <span className="block text-sm text-foreground font-medium">Inteligentne filtry</span>
                  <span className="text-xs text-muted-foreground">Grupowanie po kadencjach i typach druków.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-foreground">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <span className="block text-sm text-foreground font-medium">Wyszukiwarka AI</span>
                  <span className="text-xs text-muted-foreground">Zadaj pytanie w języku naturalnym.</span>
                </div>
              </li>
            </ul>

            <Button variant="link" className="p-0 h-auto text-foreground" asChild>
              <Link href="/search">
                Zobacz jak to działa
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-purple-500/10 rounded-xl blur-3xl" />
            <div className="relative rounded-xl p-6 border border-border bg-card/60 backdrop-blur-xl">
              
              {/* Search Input Mock */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  defaultValue="Podatek VAT" 
                  disabled 
                  className="w-full bg-muted border border-border text-foreground text-sm rounded-md py-2 pl-10 pr-4 focus:outline-none cursor-not-allowed"
                />
                <div className="absolute right-2 top-2 px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] text-muted-foreground font-mono">CMD+K</div>
              </div>

              {/* Tags/Filters Mock */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="px-3 py-1 rounded-full bg-muted border border-border text-xs text-muted-foreground flex items-center gap-2">
                  Status: Procedowane
                  <X className="h-2.5 w-2.5 cursor-pointer hover:text-foreground" />
                </div>
                <div className="px-3 py-1 rounded-full bg-muted border border-border text-xs text-muted-foreground flex items-center gap-2">
                  Druk: Rządowy
                  <X className="h-2.5 w-2.5 cursor-pointer hover:text-foreground" />
                </div>
                <div className="px-3 py-1 rounded-full border border-dashed border-border text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground hover:border-muted-foreground transition-colors">
                  <Plus className="h-3 w-3" />
                  Dodaj filtr
                </div>
              </div>

              {/* Results List Mock */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-1.5 w-1/2 bg-muted/60 rounded" />
                  </div>
                  <div className="text-xs text-muted-foreground">Dziś</div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-2/3 bg-muted rounded mb-2" />
                    <div className="h-1.5 w-1/3 bg-muted/60 rounded" />
                  </div>
                  <div className="text-xs text-muted-foreground">2 dni</div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-4/5 bg-muted rounded mb-2" />
                    <div className="h-1.5 w-2/5 bg-muted/60 rounded" />
                  </div>
                  <div className="text-xs text-muted-foreground">1 tydz.</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold text-foreground mb-1 tracking-tight">X. kadencja</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Obecna kadencja</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-foreground mb-1 tracking-tight">460</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Posłów</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-foreground mb-1 tracking-tight">800+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Projektów ustaw</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-foreground mb-1 tracking-tight">24/7</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium text-foreground mb-6 tracking-tight">Bądź świadomym obywatelem.</h2>
          <p className="text-muted-foreground mb-10 text-lg font-light">
            Dołącz do osób, które śledzą zmiany w prawie zanim wejdą w życie. Załóż darmowe konto i skonfiguruj swoje pierwsze powiadomienie.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto justify-center">
            <Button size="lg" asChild className="rounded-lg">
              <Link href="/register">Załóż darmowe konto</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-lg">
              <Link href="/bills">Przeglądaj bez konta</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Nie wysyłamy spamu. Możesz zrezygnować w każdej chwili.</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-muted rounded-lg">
                <Scale className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-muted-foreground">ŚCIEŻKA PRAWA</span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Projekt powstał podczas konkursu HackNation 2025. <br/>Dane pochodzą z publicznych API Sejmu RP.
            </p>
          </div>
          
          <div className="flex gap-16">
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-4">Platforma</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/bills" className="hover:text-foreground transition-colors">Projekty ustaw</Link></li>
                <li><Link href="/calendar" className="hover:text-foreground transition-colors">Kalendarz posiedzeń</Link></li>
                <li><Link href="/search" className="hover:text-foreground transition-colors">Wyszukiwarka AI</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-4">Źródła</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <a href="https://api.sejm.gov.pl" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                    API Sejmu RP
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </li>
                <li>
                  <a href="https://eli.gov.pl" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                    System ELI
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-4">Informacje prawne</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/policies/terms" className="hover:text-foreground transition-colors">Regulamin</Link></li>
                <li><Link href="/policies/privacy" className="hover:text-foreground transition-colors">Polityka prywatności</Link></li>
                <li><Link href="/policies/accessibility" className="hover:text-foreground transition-colors">Deklaracja dostępności</Link></li>
                <li><Link href="/help" className="hover:text-foreground transition-colors">Centrum pomocy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Ścieżka Prawa. Wszelkie prawa zastrzeżone.</span>
        </div>
      </footer>
    </div>
  )
}
