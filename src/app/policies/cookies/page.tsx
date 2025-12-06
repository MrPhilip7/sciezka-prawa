import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Cookie, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Polityka Cookies | Ścieżka Prawa',
  description: 'Informacje o plikach cookies używanych w serwisie Ścieżka Prawa'
}

export default function CookiesPolicyPage() {
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
            <Button variant="outline" size="sm">
              <Cookie className="h-4 w-4 mr-2" />
              Zarządzaj cookies
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 flex items-start gap-4">
          <Cookie className="h-12 w-12 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-4xl font-bold mb-4">Polityka Cookies</h1>
            <p className="text-muted-foreground text-lg">
              Informacje o plikach cookies używanych w serwisie
            </p>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>🍪 Co musisz wiedzieć</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>✅ <strong>Niezbędne cookies</strong> są automatycznie akceptowane (wymagane do działania serwisu)</li>
              <li>🔍 <strong>Analityczne cookies</strong> pomagają nam ulepszyć serwis (możesz odmówić)</li>
              <li>⚙️ <strong>Funkcjonalne cookies</strong> zapamiętują Twoje preferencje (możesz odmówić)</li>
              <li>🚫 <strong>Nie używamy</strong> cookies marketingowych ani sprzedażowych</li>
            </ul>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Czym są pliki cookies?</h2>
            
            <p className="mb-4">
              Pliki cookies to niewielkie pliki tekstowe zapisywane na Twoim urządzeniu podczas odwiedzania stron internetowych. 
              Pozwalają one stronie „zapamiętać" Twoje działania i preferencje (takie jak dane logowania, wybór języka, rozmiar czcionki) 
              przez pewien czas, dzięki czemu nie musisz wprowadzać ich ponownie przy każdym powrocie na stronę.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Jakich cookies używamy?</h2>
            
            <div className="space-y-6">
              {/* Necessary Cookies */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">🔒 Cookies niezbędne</CardTitle>
                    <Badge>Zawsze aktywne</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Te pliki cookies są niezbędne do prawidłowego działania strony i nie można ich wyłączyć.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border border-border p-3 text-left">Nazwa</th>
                          <th className="border border-border p-3 text-left">Cel</th>
                          <th className="border border-border p-3 text-left">Ważność</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-3"><code>sb-access-token</code></td>
                          <td className="border border-border p-3">Sesja użytkownika (logowanie)</td>
                          <td className="border border-border p-3">1 godzina</td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border p-3"><code>sb-refresh-token</code></td>
                          <td className="border border-border p-3">Odświeżanie sesji</td>
                          <td className="border border-border p-3">30 dni</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>next-auth.csrf-token</code></td>
                          <td className="border border-border p-3">Ochrona przed CSRF</td>
                          <td className="border border-border p-3">Sesja</td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border p-3"><code>cookie-consent</code></td>
                          <td className="border border-border p-3">Zapamiętanie zgody na cookies</td>
                          <td className="border border-border p-3">12 miesięcy</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Cookies */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">📊 Cookies analityczne</CardTitle>
                    <Badge variant="outline">Opcjonalne</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pomagają nam zrozumieć, jak użytkownicy korzystają z naszej strony, aby ją ulepszać.
                  </p>
                  
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border border-border p-3 text-left">Nazwa</th>
                          <th className="border border-border p-3 text-left">Dostawca</th>
                          <th className="border border-border p-3 text-left">Cel</th>
                          <th className="border border-border p-3 text-left">Ważność</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-3"><code>_ga</code></td>
                          <td className="border border-border p-3">Google Analytics</td>
                          <td className="border border-border p-3">Identyfikacja użytkownika</td>
                          <td className="border border-border p-3">2 lata</td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border p-3"><code>_ga_*</code></td>
                          <td className="border border-border p-3">Google Analytics</td>
                          <td className="border border-border p-3">Stan sesji</td>
                          <td className="border border-border p-3">2 lata</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p><strong>Zbierane dane (anonimowe):</strong></p>
                    <ul className="mt-2 space-y-1">
                      <li>• Odwiedzone strony</li>
                      <li>• Czas spędzony na stronie</li>
                      <li>• Źródło ruchu (np. Google, bezpośrednie)</li>
                      <li>• Przybliżona lokalizacja (kraj, miasto)</li>
                      <li>• Typ urządzenia i przeglądarka</li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" size="sm">Wyłącz Google Analytics</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Functional Cookies */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">⚙️ Cookies funkcjonalne</CardTitle>
                    <Badge variant="outline">Opcjonalne</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Zapamiętują Twoje preferencje i ustawienia dla lepszego doświadczenia.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border border-border p-3 text-left">Nazwa</th>
                          <th className="border border-border p-3 text-left">Cel</th>
                          <th className="border border-border p-3 text-left">Ważność</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-3"><code>theme</code></td>
                          <td className="border border-border p-3">Motyw (jasny/ciemny)</td>
                          <td className="border border-border p-3">12 miesięcy</td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="border border-border p-3"><code>font-size</code></td>
                          <td className="border border-border p-3">Rozmiar czcionki</td>
                          <td className="border border-border p-3">12 miesięcy</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>contrast-mode</code></td>
                          <td className="border border-border p-3">Tryb kontrastu</td>
                          <td className="border border-border p-3">12 miesięcy</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Jak zarządzać cookies?</h2>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔧 Panel ustawień</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Możesz zarządzać swoimi preferencjami cookies za pomocą naszego panelu ustawień:
                  </p>
                  <Button>Otwórz ustawienia cookies</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🌐 Ustawienia przeglądarki</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    Możesz również zarządzać cookies bezpośrednio w przeglądarce:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Chrome:</strong>{' '}
                      <a 
                        href="https://support.google.com/chrome/answer/95647" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Instrukcja zarządzania cookies
                      </a>
                    </li>
                    <li>
                      <strong>Firefox:</strong>{' '}
                      <a 
                        href="https://support.mozilla.org/pl/kb/ciasteczka" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Instrukcja zarządzania cookies
                      </a>
                    </li>
                    <li>
                      <strong>Safari:</strong>{' '}
                      <a 
                        href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Instrukcja zarządzania cookies
                      </a>
                    </li>
                    <li>
                      <strong>Edge:</strong>{' '}
                      <a 
                        href="https://support.microsoft.com/pl-pl/microsoft-edge/usuwanie-plik%C3%B3w-cookie-w-przegl%C4%85darce-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Instrukcja zarządzania cookies
                      </a>
                    </li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm">
                      ⚠️ <strong>Uwaga:</strong> Wyłączenie wszystkich cookies może ograniczyć funkcjonalność strony (np. niemożność zalogowania się).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Kontakt</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Jeśli masz pytania dotyczące naszej polityki cookies, skontaktuj się z nami:
                </p>
                <ul className="space-y-2">
                  <li><strong>E-mail:</strong> <a href="mailto:iod@sciezkaprawa.pl" className="text-primary hover:underline">iod@sciezkaprawa.pl</a></li>
                  <li><strong>Centrum pomocy:</strong> <Link href="/help" className="text-primary hover:underline">Przejdź do pomocy</Link></li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 justify-center">
          <Link href="/policies/terms">
            <Button variant="outline">Regulamin</Button>
          </Link>
          <Link href="/policies/privacy">
            <Button variant="outline">Polityka Prywatności</Button>
          </Link>
          <Link href="/policies/accessibility">
            <Button variant="outline">Deklaracja Dostępności</Button>
          </Link>
        </div>

        {/* Last update */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Ostatnia aktualizacja: 6 grudnia 2025</p>
        </div>
      </main>
    </div>
  )
}
