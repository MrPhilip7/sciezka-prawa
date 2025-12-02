import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

const faqItems = [
  {
    question: 'Czym jest Ścieżka Prawa?',
    answer: 'Ścieżka Prawa to platforma umożliwiająca śledzenie procesu legislacyjnego w Polsce. Pozwala monitorować projekty ustaw od ich złożenia do publikacji, otrzymywać powiadomienia o zmianach i być na bieżąco z polskim prawodawstwem.',
  },
  {
    question: 'Skąd pochodzą dane o ustawach?',
    answer: 'Dane są pobierane automatycznie z oficjalnych źródeł: API Sejmu RP oraz systemu ELI (European Legislation Identifier). Zapewnia to aktualność i wiarygodność informacji.',
  },
  {
    question: 'Jak dodać alert dla ustawy?',
    answer: 'Aby dodać alert, przejdź do szczegółów wybranej ustawy i kliknij przycisk "Dodaj alert". Możesz skonfigurować powiadomienia email w ustawieniach alertu.',
  },
  {
    question: 'Czy korzystanie z platformy jest bezpłatne?',
    answer: 'Tak, podstawowe funkcje platformy są całkowicie bezpłatne. Możesz przeglądać ustawy, dodawać alerty i otrzymywać powiadomienia bez żadnych opłat.',
  },
  {
    question: 'Jak działa proces legislacyjny w Polsce?',
    answer: 'Projekt ustawy przechodzi przez kilka etapów: złożenie w Sejmie, I czytanie, prace w komisjach, II czytanie, III czytanie i głosowanie, Senat, podpis Prezydenta, a na końcu publikacja w Dzienniku Ustaw.',
  },
]

const legislativeSteps = [
  {
    title: 'Złożenie projektu',
    description: 'Projekt ustawy jest składany do Sejmu przez uprawnione podmioty (posłów, rząd, Prezydenta, obywateli lub Senat).',
  },
  {
    title: 'I Czytanie',
    description: 'Przedstawienie projektu na posiedzeniu plenarnym Sejmu. Debata ogólna nad założeniami projektu.',
  },
  {
    title: 'Prace komisji',
    description: 'Szczegółowe prace nad projektem w komisjach sejmowych. Rozpatrywanie poprawek.',
  },
  {
    title: 'II Czytanie',
    description: 'Sprawozdanie komisji. Możliwość zgłaszania poprawek przez posłów.',
  },
  {
    title: 'III Czytanie',
    description: 'Głosowanie nad całością projektu ustawy z ewentualnymi poprawkami.',
  },
  {
    title: 'Senat',
    description: 'Rozpatrzenie ustawy przez Senat. Możliwość wprowadzenia poprawek lub odrzucenia.',
  },
  {
    title: 'Prezydent',
    description: 'Prezydent podpisuje ustawę, zawetuje ją lub skieruje do Trybunału Konstytucyjnego.',
  },
  {
    title: 'Publikacja',
    description: 'Ustawa jest publikowana w Dzienniku Ustaw i wchodzi w życie.',
  },
]

export default async function HelpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pomoc</h2>
          <p className="text-muted-foreground">
            Dowiedz się więcej o platformie i procesie legislacyjnym
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Legislative Process */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Proces legislacyjny w Polsce</CardTitle>
                </div>
                <CardDescription>
                  Jak powstaje ustawa - od projektu do publikacji
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8 space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-muted" />

                  {legislativeSteps.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <CardTitle>Często zadawane pytania</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index}>
                    <h4 className="font-medium">{item.question}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
                    {index < faqItems.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Przydatne linki</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="https://www.sejm.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>Sejm RP</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://www.senat.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>Senat RP</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://dziennikustaw.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>Dziennik Ustaw</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://eli.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>System ELI</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kontakt</CardTitle>
                <CardDescription>
                  Masz pytania? Skontaktuj się z nami
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="mailto:kontakt@sciezkaprawa.pl"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <span>kontakt@sciezkaprawa.pl</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span>Formularz kontaktowy</span>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
