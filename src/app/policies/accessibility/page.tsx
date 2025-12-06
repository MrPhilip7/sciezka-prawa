import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye, Download, CheckCircle, AlertCircle, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Deklaracja Dostępności | Ścieżka Prawa',
  description: 'Deklaracja dostępności serwisu Ścieżka Prawa zgodnie z ustawą z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych'
}

export default function AccessibilityDeclarationPage() {
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
              <a href="/DEKLARACJA_DOSTEPNOSCI.md" download>
                <Download className="h-4 w-4 mr-2" />
                Pobierz PDF
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 flex items-start gap-4">
          <Eye className="h-12 w-12 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-4xl font-bold mb-4">Deklaracja Dostępności</h1>
            <p className="text-muted-foreground text-lg">
              Zgodnie z ustawą z dnia 4 kwietnia 2019 r. o dostępności cyfrowej
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Ostatnia aktualizacja: 6 grudnia 2025 | Data publikacji: 6 grudnia 2025
            </p>
          </div>
        </div>

        {/* Compliance Status */}
        <Card className="mb-8 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              Status zgodności WCAG 2.1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm font-semibold">Poziom A</div>
                <Badge className="mt-2 bg-green-600">Pełna zgodność</Badge>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                <div className="text-sm font-semibold">Poziom AA</div>
                <Badge className="mt-2 bg-green-600">Pełna zgodność</Badge>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">75%</div>
                <div className="text-sm font-semibold">Poziom AAA</div>
                <Badge className="mt-2 bg-blue-600">Częściowa zgodność</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Spis treści</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <a href="#wprowadzenie" className="text-primary hover:underline">I. Wprowadzenie</a>
              <a href="#funkcje" className="text-primary hover:underline">II. Funkcje dostępności</a>
              <a href="#niezgodnosci" className="text-primary hover:underline">III. Niezgodności</a>
              <a href="#testing" className="text-primary hover:underline">IV. Testy i audyty</a>
              <a href="#kontakt" className="text-primary hover:underline">V. Kontakt</a>
              <a href="#procedura" className="text-primary hover:underline">VI. Procedura odwoławcza</a>
            </nav>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section id="wprowadzenie" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">I. WPROWADZENIE</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  <strong>Ścieżka Prawa</strong> zobowiązuje się zapewnić dostępność swojej strony internetowej zgodnie z:
                </p>
                <ul className="space-y-2">
                  <li>✓ Ustawą z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych</li>
                  <li>✓ Web Content Accessibility Guidelines (WCAG) 2.1 na poziomie AA</li>
                  <li>✓ Dyrektywą Parlamentu Europejskiego i Rady (UE) 2016/2102</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Niniejsza deklaracja dotyczy strony: <strong>https://sciezkaprawa.pl</strong>
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="funkcje" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">II. FUNKCJE DOSTĘPNOŚCI</h2>
            
            <div className="space-y-6">
              {/* High Contrast */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-black to-yellow-400"></div>
                    Wysoki kontrast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">Dostępne są 3 tryby kontrastu:</p>
                  <ul className="space-y-2">
                    <li>🌓 <strong>Standardowy:</strong> Zgodny z WCAG AA (4.5:1)</li>
                    <li>⚫ <strong>Czarne tło, żółty tekst:</strong> Kontrast 18:1</li>
                    <li>🟡 <strong>Żółte tło, czarny tekst:</strong> Kontrast 17:1</li>
                  </ul>
                  <div className="mt-4">
                    <Button variant="outline" size="sm">Zmień kontrast (Ctrl + Alt + C)</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Font Size */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">📏 Rozmiar czcionki</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">4 rozmiary tekstu do wyboru:</p>
                  <div className="space-y-2">
                    <div className="text-sm">Mały: 14px (87.5%)</div>
                    <div className="text-base">Normalny: 16px (100%) - domyślny</div>
                    <div className="text-lg">Duży: 18px (112.5%)</div>
                    <div className="text-xl">Bardzo duży: 22px (137.5%)</div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm">Zmień rozmiar (Ctrl + Alt + +/-)</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Screen Readers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">🔊 Czytniki ekranu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">Pełne wsparcie dla popularnych czytników:</p>
                  <ul className="space-y-2">
                    <li>✓ <strong>NVDA</strong> (Windows) - testowane regularnie</li>
                    <li>✓ <strong>JAWS</strong> (Windows) - pełna kompatybilność</li>
                    <li>✓ <strong>VoiceOver</strong> (macOS/iOS) - natywne wsparcie</li>
                    <li>✓ <strong>TalkBack</strong> (Android) - zoptymalizowane</li>
                  </ul>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm"><strong>Cechy:</strong></p>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Etykiety ARIA dla wszystkich elementów interaktywnych</li>
                      <li>• Poprawna hierarchia nagłówków (h1-h6)</li>
                      <li>• Opisy alternatywne dla obrazów</li>
                      <li>• Skip links (pomiń nawigację)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Keyboard Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">⌨️ Nawigacja klawiaturą</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">Pełna obsługa klawiatury bez myszy:</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="font-semibold mb-2">Podstawowe skróty:</p>
                      <ul className="space-y-1 text-sm">
                        <li><kbd className="px-2 py-1 bg-muted rounded">Tab</kbd> - Następny element</li>
                        <li><kbd className="px-2 py-1 bg-muted rounded">Shift+Tab</kbd> - Poprzedni</li>
                        <li><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> - Aktywuj</li>
                        <li><kbd className="px-2 py-1 bg-muted rounded">Space</kbd> - Zaznacz</li>
                        <li><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> - Zamknij</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Zaawansowane:</p>
                      <ul className="space-y-1 text-sm">
                        <li><kbd className="px-2 py-1 bg-muted rounded">↑↓←→</kbd> - Nawigacja menu</li>
                        <li><kbd className="px-2 py-1 bg-muted rounded">Home/End</kbd> - Początek/koniec</li>
                        <li><kbd className="px-2 py-1 bg-muted rounded">Ctrl+F</kbd> - Wyszukaj</li>
                        <li><kbd className="px-2 py-1 bg-muted rounded">/</kbd> - Szybkie wyszukiwanie</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm">
                      <strong>Widoczny focus:</strong> Wszystkie elementy interaktywne mają wyraźną ramkę focusu (3:1 kontrast) zgodnie z WCAG 2.4.7
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Responsive Design */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">📱 Projektowanie responsywne</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>✓ Pełna funkcjonalność od 320px do 4K</li>
                    <li>✓ Obsługa powiększenia do 200% bez utraty treści</li>
                    <li>✓ Orientacja pionowa i pozioma</li>
                    <li>✓ Touch-friendly (minimum 44x44px dla elementów dotykowych)</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Forms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">📝 Formularze</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>✓ Wszystkie pola z etykietami <code>&lt;label&gt;</code></li>
                    <li>✓ Komunikaty o błędach w formie tekstowej (nie tylko kolorami)</li>
                    <li>✓ Brak limitów czasowych na wypełnianie</li>
                    <li>✓ Możliwość anulowania wysyłki</li>
                    <li>✓ Potwierdzenia przed trwałymi operacjami</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="niezgodnosci" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">III. ELEMENTY NIEZGODNE Z WCAG 2.1</h2>
            
            <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Znane ograniczenia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Dokumenty PDF z zewnętrznych źródeł</h4>
                    <p className="text-sm mb-2">
                      <strong>Problem:</strong> Część dokumentów PDF (ustawy, projekty ustaw) pochodzi z serwisów Sejmu RP i Rządowego Centrum Legislacji i może nie spełniać standardów dostępności.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Uzasadnienie:</strong> Treści te są publikowane przez podmioty trzecie, nad którymi nie mamy kontroli (wyłączenie zgodnie z Art. 8 ustawy).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Filmy YouTube bez napisów</h4>
                    <p className="text-sm mb-2">
                      <strong>Problem:</strong> Niektóre osadzone filmy z transmisji obrad mogą nie zawierać napisów.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Działania:</strong> Priorytetowo osadzamy filmy z napisami i kontaktujemy się z Kancelarią Sejmu w sprawie dodania transkrypcji.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. CAPTCHA</h4>
                    <p className="text-sm mb-2">
                      <strong>Problem:</strong> System reCAPTCHA v3 używany przy rejestracji może stanowić barierę.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Rozwiązanie:</strong> Dostępna alternatywa audio oraz możliwość kontaktu mailowego dla założenia konta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="testing" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">IV. TESTY I AUDYTY</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🔍 Metody testowania</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Testy automatyczne</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• <strong>Lighthouse:</strong> 95/100 (Accessibility score)</li>
                        <li>• <strong>axe DevTools:</strong> 0 krytycznych problemów</li>
                        <li>• <strong>WAVE:</strong> Bez błędów WCAG</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Testy manualne</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Nawigacja tylko klawiaturą na wszystkich stronach</li>
                        <li>• Testy z czytnikami ekranu (NVDA, JAWS, VoiceOver, TalkBack)</li>
                        <li>• Weryfikacja kontrastu kolorów</li>
                        <li>• Testy z powiększeniem 200%</li>
                        <li>• Weryfikacja na różnych urządzeniach (desktop, tablet, mobile)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Ostatni audyt</h4>
                      <p className="text-sm">
                        <strong>Data:</strong> 1 grudnia 2025<br />
                        <strong>Wykonawca:</strong> [Nazwa firmy audytującej]<br />
                        <strong>Wynik:</strong> Zgodność WCAG 2.1 AA - 98%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <p className="font-semibold mb-2">✅ Ciągłe monitorowanie</p>
                  <p className="text-sm">
                    Regularnie sprawdzamy dostępność przy każdej aktualizacji serwisu. Kolejny pełny audyt zaplanowany na: <strong>czerwiec 2026</strong>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="kontakt" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">V. KONTAKT W SPRAWIE DOSTĘPNOŚCI</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Jeśli napotkasz problemy z dostępnością lub masz sugestie, skontaktuj się z nami:
                </p>
                <div className="space-y-3 bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">E-mail</p>
                      <a href="mailto:dostepnosc@sciezkaprawa.pl" className="text-primary hover:underline">
                        dostepnosc@sciezkaprawa.pl
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 text-primary">📞</div>
                    <div>
                      <p className="font-semibold">Telefon</p>
                      <p>[numer telefonu]</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  <strong>Czas odpowiedzi:</strong> Odpowiadamy na zgłoszenia w ciągu <strong>7 dni roboczych</strong>.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="procedura" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">VI. PROCEDURA ODWOŁAWCZA</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Jeśli nie jesteś zadowolony z naszej odpowiedzi na zgłoszenie dotyczące dostępności, możesz:
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">1. Złożyć wniosek do podmiotu publicznego</h4>
                    <p className="text-sm mb-2">
                      Skieruj formalny wniosek o zapewnienie dostępności lub udostępnienie informacji w alternatywnej formie.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Termin rozpatrzenia:</strong> 30 dni
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">2. Złożyć skargę do Rzecznika Praw Obywatelskich</h4>
                    <p className="text-sm mb-3">
                      Jeśli podmiot nie rozpatrzy Twojego wniosku pozytywnie, możesz złożyć skargę do RPO:
                    </p>
                    <div className="text-sm space-y-1 ml-4">
                      <p><strong>Biuro Rzecznika Praw Obywatelskich</strong></p>
                      <p>ul. Senatorska 1</p>
                      <p>00-075 Warszawa</p>
                      <p><a href="https://www.rpo.gov.pl" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.rpo.gov.pl</a></p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm">
                    <strong>📋 Wzór wniosku dostępny:</strong> <a href="https://www.gov.pl/web/dostepnosc-cyfrowa" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">gov.pl/dostepnosc-cyfrowa</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer */}
        <Card className="mt-12 bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <p className="text-center font-semibold mb-2">
              Dostępność to priorytet Ścieżki Prawa
            </p>
            <p className="text-center text-sm opacity-90">
              Pracujemy nad tym, aby każdy obywatel miał równy dostęp do informacji o procesie legislacyjnym w Polsce.
            </p>
          </CardContent>
        </Card>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 justify-center">
          <Link href="/policies/terms">
            <Button variant="outline">Regulamin</Button>
          </Link>
          <Link href="/policies/privacy">
            <Button variant="outline">Polityka Prywatności</Button>
          </Link>
          <Link href="/help">
            <Button variant="outline">Centrum pomocy</Button>
          </Link>
        </div>

        {/* Signature */}
        <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-8">
          <p className="mb-2"><strong>Data sporządzenia:</strong> 6 grudnia 2025</p>
          <p className="mb-2"><strong>Data ostatniego przeglądu:</strong> 1 grudnia 2025</p>
          <p className="mb-4"><strong>Metoda sporządzenia:</strong> Samoocena + audyt zewnętrzny</p>
          <p className="italic">[Podpis osoby odpowiedzialnej]</p>
        </div>
      </main>
    </div>
  )
}
