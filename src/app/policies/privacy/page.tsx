import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Download, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Polityka Prywatności | Ścieżka Prawa',
  description: 'Polityka Prywatności serwisu Ścieżka Prawa - informacje o przetwarzaniu danych osobowych zgodnie z RODO/GDPR'
}

export default function PrivacyPolicyPage() {
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
              <a href="/POLITYKA_PRYWATNOSCI.md" download>
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
          <Shield className="h-12 w-12 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-4xl font-bold mb-4">Polityka Prywatności</h1>
            <p className="text-muted-foreground text-lg">
              Zgodnie z RODO (Rozporządzenie UE 2016/679) | Ostatnia aktualizacja: 6 grudnia 2025
            </p>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Twoje prawa w skrócie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>✅ <strong>Pełna kontrola</strong> – możesz w każdej chwili usunąć konto i wszystkie dane</li>
              <li>✅ <strong>Bezpieczeństwo</strong> – SSL/TLS, szyfrowanie haseł, regularne backupy</li>
              <li>✅ <strong>Przejrzystość</strong> – szczegółowe informacje o przetwarzaniu danych</li>
              <li>✅ <strong>Zgodność z RODO</strong> – wszystkie prawa gwarantowane przez GDPR</li>
            </ul>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Spis treści</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <a href="#administrator" className="text-primary hover:underline">I. Administrator danych</a>
              <a href="#zakres" className="text-primary hover:underline">II. Zakres danych</a>
              <a href="#cele" className="text-primary hover:underline">III. Cele przetwarzania</a>
              <a href="#udostepnianie" className="text-primary hover:underline">IV. Udostępnianie danych</a>
              <a href="#prawa" className="text-primary hover:underline">V. Twoje prawa</a>
              <a href="#bezpieczenstwo" className="text-primary hover:underline">VI. Bezpieczeństwo</a>
              <a href="#cookies" className="text-primary hover:underline">VII. Cookies</a>
              <a href="#maloletni" className="text-primary hover:underline">VIII. Małoletni</a>
            </nav>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section id="administrator" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">I. ADMINISTRATOR DANYCH OSOBOWYCH</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nazwa podmiotu</p>
                    <p className="font-semibold">[Nazwa podmiotu]</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Adres</p>
                    <p className="font-semibold">[Adres]</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NIP/REGON</p>
                    <p className="font-semibold">[NIP] / [REGON]</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inspektor Ochrony Danych (IOD)</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      [iod@domena.pl]
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="zakres" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">II. ZAKRES PRZETWARZANYCH DANYCH</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Dane zbierane automatycznie</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Adres IP</li>
                  <li>Typ przeglądarki i system operacyjny</li>
                  <li>Data i godzina wizyty</li>
                  <li>Odwiedzone podstrony</li>
                  <li>Źródło wejścia (referer)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Dane podawane przez użytkownika</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Rejestracja:</strong> adres e-mail, hasło (zaszyfrowane), imię i nazwisko</li>
                  <li><strong>Profil:</strong> opcjonalne dane kontaktowe, awatar</li>
                  <li><strong>Aktywność:</strong> komentarze, propozycje zmian, głosowania</li>
                  <li><strong>Preferencje:</strong> alerty dla ustaw, ustawienia powiadomień</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Logowanie społecznościowe</h3>
                <p className="mb-3">Przy logowaniu przez:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google:</strong> e-mail, imię, nazwisko, zdjęcie profilowe</li>
                  <li><strong>Facebook:</strong> e-mail, imię, nazwisko, zdjęcie profilowe</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">Możesz w każdej chwili odłączyć konta w ustawieniach profilu.</p>
              </div>
            </div>
          </section>

          <section id="cele" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">III. CELE PRZETWARZANIA DANYCH</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left">Cel przetwarzania</th>
                    <th className="border border-border p-3 text-left">Podstawa prawna (RODO)</th>
                    <th className="border border-border p-3 text-left">Okres przechowywania</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Rejestracja i prowadzenie konta</td>
                    <td className="border border-border p-3">Art. 6 ust. 1 lit. b (umowa)</td>
                    <td className="border border-border p-3">Do usunięcia konta</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border p-3">Wysyłka alertów i powiadomień</td>
                    <td className="border border-border p-3">Art. 6 ust. 1 lit. a (zgoda)</td>
                    <td className="border border-border p-3">Do wycofania zgody</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Moderacja treści</td>
                    <td className="border border-border p-3">Art. 6 ust. 1 lit. f (prawnie uzasadniony interes)</td>
                    <td className="border border-border p-3">2 lata od publikacji</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border p-3">Statystyki (anonimowe)</td>
                    <td className="border border-border p-3">Art. 6 ust. 1 lit. f (prawnie uzasadniony interes)</td>
                    <td className="border border-border p-3">26 miesięcy</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Ochrona przed nadużyciami</td>
                    <td className="border border-border p-3">Art. 6 ust. 1 lit. f (prawnie uzasadniony interes)</td>
                    <td className="border border-border p-3">5 lat</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border p-3">Konsultacje społeczne</td>
                    <td className="border border-border p-3">Art. 6 ust. 1 lit. c (obowiązek prawny)</td>
                    <td className="border border-border p-3">Zgodnie z prawem archiwalnym</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="prawa" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">V. TWOJE PRAWA (RODO)</h2>
            
            <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-200 dark:border-green-800 mb-6">
              <p className="font-semibold mb-4">Zgodnie z RODO, przysługują Ci następujące prawa:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">🔍 Prawo dostępu (Art. 15 RODO)</h4>
                  <p className="text-sm mt-1">Możesz uzyskać informacje o przetwarzaniu swoich danych oraz kopię danych.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg">✏️ Prawo do sprostowania (Art. 16 RODO)</h4>
                  <p className="text-sm mt-1">Możesz poprawiać nieprawidłowe lub uzupełniać niekompletne dane.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg">🗑️ Prawo do usunięcia - „prawo do bycia zapomnianym" (Art. 17 RODO)</h4>
                  <p className="text-sm mt-1">Możesz żądać usunięcia danych, gdy przestały być potrzebne lub wycofałeś zgodę.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg">⏸️ Prawo do ograniczenia przetwarzania (Art. 18 RODO)</h4>
                  <p className="text-sm mt-1">Możesz żądać zawieszenia przetwarzania w określonych sytuacjach.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg">📤 Prawo do przenoszenia danych (Art. 20 RODO)</h4>
                  <p className="text-sm mt-1">Możesz otrzymać dane w formacie JSON/CSV i przenieść je do innego serwisu.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg">✋ Prawo sprzeciwu (Art. 21 RODO)</h4>
                  <p className="text-sm mt-1">Możesz sprzeciwić się przetwarzaniu opartemu na prawnie uzasadnionym interesie.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg">⚖️ Prawo do skargi</h4>
                  <p className="text-sm mt-1">Możesz złożyć skargę do Urzędu Ochrony Danych Osobowych (UODO).</p>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <p className="font-semibold mb-3">Jak skorzystać z praw?</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Zaloguj się i przejdź do <Link href="/settings" className="text-primary hover:underline">Ustawień konta</Link></li>
                  <li>W sekcji „Prywatność i dane" wybierz odpowiednią opcję</li>
                  <li>Lub wyślij e-mail na: <a href="mailto:iod@sciezkaprawa.pl" className="text-primary hover:underline">iod@sciezkaprawa.pl</a></li>
                </ol>
                <p className="text-sm text-muted-foreground mt-4">Odpowiemy na Twoje żądanie w ciągu <strong>7 dni</strong>.</p>
              </CardContent>
            </Card>
          </section>

          <section id="bezpieczenstwo" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">VI. BEZPIECZEŃSTWO DANYCH</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔒 Szyfrowanie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ SSL/TLS dla całego ruchu</li>
                    <li>✓ Hasła szyfrowane (bcrypt)</li>
                    <li>✓ Dane w bazie zaszyfrowane</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🛡️ Zabezpieczenia</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Firewall aplikacyjny (WAF)</li>
                    <li>✓ Ochrona DDoS</li>
                    <li>✓ Regularne audyty bezpieczeństwa</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💾 Kopie zapasowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Codzienne backupy</li>
                    <li>✓ Przechowywanie 30 dni</li>
                    <li>✓ Szyfrowane replikacje</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">👥 Kontrola dostępu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Row Level Security (RLS)</li>
                    <li>✓ 2FA dla administratorów</li>
                    <li>✓ Logi dostępów</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6">
                <p className="font-semibold mb-2">⚠️ Incydenty bezpieczeństwa</p>
                <p className="text-sm">W przypadku naruszenia bezpieczeństwa danych, powiadomimy Cię i UODO w ciągu <strong>72 godzin</strong> zgodnie z Art. 33 RODO.</p>
              </CardContent>
            </Card>
          </section>

          <section id="cookies" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">VII. PLIKI COOKIES</h2>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>🍪 Rodzaje cookies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li>
                      <strong>Niezbędne (nie wymagają zgody):</strong>
                      <p className="text-sm text-muted-foreground">Sesja użytkownika, bezpieczeństwo, ustawienia językowe</p>
                    </li>
                    <li>
                      <strong>Analityczne (wymagają zgody):</strong>
                      <p className="text-sm text-muted-foreground">Google Analytics, statystyki odwiedzin (anonimowe)</p>
                    </li>
                    <li>
                      <strong>Funkcjonalne (wymagają zgody):</strong>
                      <p className="text-sm text-muted-foreground">Zapamiętywanie preferencji (motyw, rozmiar czcionki)</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="mb-3">Możesz zarządzać cookies:</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">Ustawienia cookies</Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/policies/cookies">Polityka cookies</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="maloletni" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">VIII. DANE MAŁOLETNICH</h2>
            
            <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li>✓ Minimalny wiek: <strong>13 lat</strong></li>
                  <li>✓ Osoby poniżej 16. roku życia wymagają zgody rodzica/opiekuna prawnego</li>
                  <li>✓ Możliwość weryfikacji wieku przy rejestracji</li>
                  <li>✓ Specjalne zabezpieczenia dla kont małoletnich</li>
                </ul>
                <p className="mt-4 text-sm">
                  Jeśli jesteś rodzicem/opiekunem i chcesz usunąć konto dziecka, skontaktuj się: <a href="mailto:iod@sciezkaprawa.pl" className="text-primary hover:underline">iod@sciezkaprawa.pl</a>
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Contact Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pytania o prywatność?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Skontaktuj się z Inspektorem Ochrony Danych:</p>
            <div className="space-y-2">
              <p><strong>E-mail:</strong> <a href="mailto:iod@sciezkaprawa.pl" className="text-primary hover:underline">iod@sciezkaprawa.pl</a></p>
              <p><strong>Czas odpowiedzi:</strong> 48 godzin (sprawy pilne), 7 dni (pozostałe)</p>
            </div>
            <div className="mt-6">
              <Link href="/help">
                <Button>Przejdź do centrum pomocy</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 justify-center">
          <Link href="/policies/terms">
            <Button variant="outline">Regulamin</Button>
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
          <p>Ostatnia aktualizacja: 6 grudnia 2025</p>
          <p className="mt-2">Dokument zgodny z RODO (Rozporządzenie UE 2016/679)</p>
        </div>
      </main>
    </div>
  )
}
