import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Regulamin | Ścieżka Prawa',
  description: 'Regulamin korzystania z serwisu Ścieżka Prawa - zasady użytkowania, ochrona danych osobowych, prawa i obowiązki użytkowników'
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <ArrowLeft className="h-5 w-5" />
              <span>Powrót do strony głównej</span>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <a href="/REGULAMIN.md" download>
                <Download className="h-4 w-4 mr-2" />
                Pobierz PDF
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Regulamin Serwisu</h1>
          <p className="text-muted-foreground text-lg">
            Aktualna wersja: 1.0 | Data wejścia w życie: 6 grudnia 2025
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Spis treści</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <a href="#postanowienia-ogolne" className="text-primary hover:underline">I. Postanowienia ogólne</a>
              <a href="#rejestracja" className="text-primary hover:underline">II. Rejestracja i konto</a>
              <a href="#zasady" className="text-primary hover:underline">III. Zasady korzystania</a>
              <a href="#prawa-autorskie" className="text-primary hover:underline">IV. Prawa autorskie</a>
              <a href="#rodo" className="text-primary hover:underline">V. Ochrona danych (RODO)</a>
              <a href="#cookies" className="text-primary hover:underline">VI. Pliki cookies</a>
              <a href="#odpowiedzialnosc" className="text-primary hover:underline">VII. Odpowiedzialność</a>
              <a href="#zmiany" className="text-primary hover:underline">VIII. Zmiany regulaminu</a>
              <a href="#spory" className="text-primary hover:underline">IX. Rozwiązywanie sporów</a>
              <a href="#kontakt" className="text-primary hover:underline">X. Kontakt</a>
            </nav>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section id="postanowienia-ogolne" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">I. POSTANOWIENIA OGÓLNE</h2>
            
            <h3 className="text-2xl font-semibold mb-4">1. Definicje</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Serwis</strong> – platforma internetowa „Ścieżka Prawa", służąca do monitorowania procesu legislacyjnego w Polsce.</li>
              <li><strong>Administrator</strong> – podmiot odpowiedzialny za prowadzenie Serwisu i przetwarzanie danych osobowych Użytkowników.</li>
              <li><strong>Użytkownik</strong> – osoba korzystająca z Serwisu, zarówno zarejestrowana, jak i niezarejestrowana.</li>
              <li><strong>Konto</strong> – indywidualne konto Użytkownika w Serwisie.</li>
              <li><strong>Treści</strong> – wszelkie informacje, komentarze, propozycje zmian publikowane przez Użytkowników.</li>
            </ol>

            <h3 className="text-2xl font-semibold mb-4 mt-6">2. Zakres regulaminu</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Niniejszy Regulamin określa zasady korzystania z Serwisu Ścieżka Prawa.</li>
              <li>Korzystanie z Serwisu oznacza akceptację Regulaminu.</li>
              <li>Użytkownik zobowiązany jest do przestrzegania postanowień Regulaminu.</li>
            </ol>
          </section>

          <section id="rejestracja" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">II. REJESTRACJA I KONTO</h2>
            
            <h3 className="text-2xl font-semibold mb-4">3. Zakładanie konta</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Rejestracja w Serwisie jest dobrowolna i bezpłatna.</li>
              <li>Do założenia konta wymagane jest podanie:
                <ul className="list-disc pl-6 mt-2">
                  <li>Adresu e-mail</li>
                  <li>Hasła spełniającego wymagania bezpieczeństwa</li>
                  <li>Imienia i nazwiska</li>
                </ul>
              </li>
              <li>Użytkownik może korzystać z funkcji logowania przez dostawców tożsamości (Google, Facebook).</li>
              <li>Minimalny wiek Użytkownika: 13 lat (osoby poniżej 16. roku życia wymagają zgody opiekuna prawnego).</li>
            </ol>

            <h3 className="text-2xl font-semibold mb-4 mt-6">4. Ochrona konta</h3>
            <p>Użytkownik zobowiązany jest do:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Zachowania poufności danych logowania</li>
              <li>Niezwłocznego powiadomienia Administratora o podejrzeniu naruszenia bezpieczeństwa</li>
              <li>Wylogowania się po zakończeniu korzystania z Serwisu na urządzeniach współdzielonych</li>
            </ul>
          </section>

          <section id="zasady" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">III. ZASADY KORZYSTANIA Z SERWISU</h2>
            
            <h3 className="text-2xl font-semibold mb-4">6. Dozwolone użycie</h3>
            <p>Serwis służy do:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Śledzenia procesu legislacyjnego</li>
              <li>Uczestniczenia w konsultacjach społecznych</li>
              <li>Wyrażania opinii i propozycji zmian w projektach ustaw</li>
              <li>Otrzymywania powiadomień o zmianach w ustawach</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-4 mt-6">7. Zakazane działania</h3>
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-semibold mb-2">Użytkownik nie może:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publikować treści niezgodnych z prawem polskim</li>
                <li>Naruszać praw osób trzecich</li>
                <li>Publikować treści obraźliwych, wulgarnych lub pornograficznych</li>
                <li>Stosować mowy nienawiści</li>
                <li>Publikować spam lub reklam</li>
                <li>Podszywać się pod inne osoby</li>
                <li>Zakłócać działania Serwisu lub atakować jego infrastrukturę</li>
              </ul>
            </div>
          </section>

          <section id="rodo" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">V. OCHRONA DANYCH OSOBOWYCH (RODO)</h2>
            
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
              <h3 className="text-xl font-semibold mb-3">Administrator danych</h3>
              <p className="mb-2"><strong>Nazwa:</strong> [Nazwa podmiotu]</p>
              <p className="mb-2"><strong>Adres:</strong> [Adres]</p>
              <p className="mb-2"><strong>E-mail:</strong> [kontakt@domena.pl]</p>
              <p><strong>Inspektor Ochrony Danych:</strong> [iod@domena.pl]</p>
            </div>

            <h3 className="text-2xl font-semibold mb-4">Prawa Użytkownika</h3>
            <p>Zgodnie z RODO, masz prawo do:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dostępu do swoich danych</li>
              <li>Sprostowania danych</li>
              <li>Usunięcia danych („prawo do bycia zapomnianym")</li>
              <li>Ograniczenia przetwarzania</li>
              <li>Przenoszenia danych</li>
              <li>Sprzeciwu wobec przetwarzania</li>
              <li>Wycofania zgody w dowolnym momencie</li>
              <li>Wniesienia skargi do UODO</li>
            </ul>
            
            <Link href="/policies/privacy">
              <Button className="mt-4" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Czytaj pełną Politykę Prywatności
              </Button>
            </Link>
          </section>

          <section id="kontakt" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">X. KONTAKT</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">Wszelkie pytania dotyczące Regulaminu należy kierować na:</p>
                <ul className="space-y-2">
                  <li><strong>E-mail:</strong> kontakt@sciezkaprawa.pl</li>
                  <li><strong>Formularz kontaktowy:</strong> <Link href="/help" className="text-primary hover:underline">Przejdź do pomocy</Link></li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 justify-center">
          <Link href="/policies/privacy">
            <Button variant="outline">Polityka Prywatności</Button>
          </Link>
          <Link href="/policies/accessibility">
            <Button variant="outline">Deklaracja Dostępności</Button>
          </Link>
          <Link href="/policies/cookies">
            <Button variant="outline">Polityka Cookies</Button>
          </Link>
        </div>

        {/* Last update */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Ostatnia aktualizacja: 6 grudnia 2025 | Wersja 1.0</p>
          <p className="mt-2">Korzystając z Serwisu Ścieżka Prawa, akceptujesz niniejszy Regulamin.</p>
        </div>
      </main>
    </div>
  )
}
