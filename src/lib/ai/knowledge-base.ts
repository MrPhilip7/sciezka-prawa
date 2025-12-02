// Baza wiedzy RAG dla asystenta AI
// Zawiera informacje o procesie legislacyjnym i działaniu aplikacji

export const knowledgeBase = {
  // Informacje o aplikacji
  app: {
    name: "Ścieżka Prawa",
    description: "Aplikacja do śledzenia procesu legislacyjnego w Polsce",
    features: [
      "Przeglądanie projektów ustaw z oficjalnego API Sejmu",
      "Wyszukiwanie ustaw po tytule, opisie, wnioskodawcy",
      "Filtrowanie po statusie, roku, kadencji, kategorii",
      "Zapisywanie ulubionych projektów",
      "Powiadomienia o zmianach w śledzonych ustawach",
      "Panel administracyjny dla zarządzania treścią",
      "Tryb ciemny i jasny",
    ],
    navigation: {
      panel: "Główny dashboard z podsumowaniem aktywności",
      ustawy: "Lista wszystkich projektów ustaw z filtrami",
      wyszukiwarka: "Zaawansowane wyszukiwanie projektów",
      powiadomienia: "Zarządzanie alertami o zmianach",
      zapisane: "Twoje ulubione projekty ustaw",
      ustawienia: "Personalizacja aplikacji",
      pomoc: "Przewodnik po procesie legislacyjnym",
    }
  },

  // Proces legislacyjny w Polsce
  legislativeProcess: {
    overview: `Proces legislacyjny w Polsce to wieloetapowa procedura tworzenia prawa. 
    Projekt ustawy przechodzi przez Sejm i Senat, a następnie trafia do Prezydenta, 
    który może go podpisać, zawetować lub skierować do Trybunału Konstytucyjnego.`,
    
    stages: [
      {
        name: "Projekt",
        code: "draft",
        description: "Początkowa faza - projekt jest przygotowywany przez wnioskodawcę"
      },
      {
        name: "Złożony",
        code: "submitted",
        description: "Projekt został oficjalnie złożony w Sejmie i czeka na rozpatrzenie"
      },
      {
        name: "I czytanie",
        code: "first_reading",
        description: "Pierwsze czytanie na posiedzeniu Sejmu - prezentacja projektu i debata"
      },
      {
        name: "Komisja",
        code: "committee",
        description: "Prace w komisjach sejmowych - szczegółowa analiza i poprawki"
      },
      {
        name: "II czytanie",
        code: "second_reading",
        description: "Drugie czytanie - sprawozdanie komisji, zgłaszanie poprawek"
      },
      {
        name: "III czytanie",
        code: "third_reading",
        description: "Trzecie czytanie - głosowanie nad projektem ustawy"
      },
      {
        name: "Senat",
        code: "senate",
        description: "Rozpatrywanie ustawy przez Senat - może przyjąć, odrzucić lub wprowadzić poprawki"
      },
      {
        name: "Prezydent",
        code: "presidential",
        description: "Ustawa trafia do Prezydenta - może podpisać, zawetować lub skierować do TK"
      },
      {
        name: "Opublikowana",
        code: "published",
        description: "Ustawa została podpisana i opublikowana w Dzienniku Ustaw - wchodzi w życie"
      },
      {
        name: "Odrzucona",
        code: "rejected",
        description: "Projekt został odrzucony na którymś etapie procesu legislacyjnego"
      }
    ],

    submitterTypes: {
      poselski: "Projekt złożony przez grupę co najmniej 15 posłów",
      rzadowy: "Projekt przygotowany przez Radę Ministrów (rząd)",
      senacki: "Projekt złożony przez Senat",
      prezydencki: "Projekt złożony przez Prezydenta RP",
      obywatelski: "Inicjatywa obywatelska - wymaga 100 000 podpisów",
      komisyjny: "Projekt przygotowany przez komisję sejmową"
    },

    sejm: {
      description: "Sejm RP to izba niższa polskiego parlamentu, składająca się z 460 posłów",
      role: "Uchwala ustawy, kontroluje rząd, uchwala budżet państwa",
      kadencja: "4 lata (obecna X kadencja rozpoczęła się w 2023 roku)"
    },

    senat: {
      description: "Senat RP to izba wyższa parlamentu, składająca się ze 100 senatorów",
      role: "Rozpatruje ustawy uchwalone przez Sejm, może wprowadzać poprawki",
      czasNaRozpatrzenie: "30 dni od otrzymania ustawy (niektóre ustawy - 14 dni)"
    },

    prezydent: {
      description: "Prezydent RP podpisuje ustawy lub może je zawetować",
      weto: "Sejm może odrzucić weto większością 3/5 głosów",
      trybunalKonstytucyjny: "Prezydent może skierować ustawę do TK przed podpisaniem"
    }
  },

  // FAQ
  faq: [
    {
      question: "Jak śledzić konkretną ustawę?",
      answer: "Znajdź interesującą Cię ustawę w zakładce 'Ustawy' lub przez wyszukiwarkę, a następnie kliknij ikonę dzwonka, aby dodać alert. Otrzymasz powiadomienie gdy zmieni się status ustawy."
    },
    {
      question: "Co oznaczają poszczególne statusy ustaw?",
      answer: "Statusy odpowiadają etapom procesu legislacyjnego: od 'Projekt' (początek) przez kolejne czytania w Sejmie, prace w komisjach, Senat, aż do 'Opublikowana' (ustawa weszła w życie) lub 'Odrzucona'."
    },
    {
      question: "Skąd pochodzą dane o ustawach?",
      answer: "Dane są pobierane z oficjalnego API Sejmu RP (api.sejm.gov.pl) i automatycznie synchronizowane, aby zapewnić aktualność informacji."
    },
    {
      question: "Jak działa wyszukiwarka?",
      answer: "Możesz szukać po tytule, opisie lub numerze ustawy. Dodatkowo możesz filtrować wyniki po typie wnioskodawcy, kategorii, roku złożenia, kadencji Sejmu i statusie."
    },
    {
      question: "Czy mogę zapisać ulubione ustawy?",
      answer: "Tak! Kliknij ikonę zakładki przy ustawie, aby dodać ją do zapisanych. Wszystkie zapisane projekty znajdziesz w zakładce 'Zapisane'."
    },
    {
      question: "Jak zmienić motyw na ciemny?",
      answer: "Możesz zmienić motyw w Ustawieniach lub używając przełącznika na dole panelu bocznego (ikony słońca, księżyca i monitora)."
    },
    {
      question: "Ile trwa proces legislacyjny?",
      answer: "Czas trwania jest różny - od kilku tygodni dla pilnych projektów rządowych, do kilku miesięcy lub nawet lat dla skomplikowanych ustaw. Średnio proces trwa 3-6 miesięcy."
    },
    {
      question: "Kto może złożyć projekt ustawy?",
      answer: "Inicjatywę ustawodawczą mają: grupa 15 posłów, Senat, Prezydent, Rada Ministrów, oraz obywatele (minimum 100 000 podpisów)."
    }
  ],

  // Słownik terminów
  glossary: {
    "czytanie": "Etap rozpatrywania projektu ustawy na posiedzeniu Sejmu. Każdy projekt przechodzi przez trzy czytania.",
    "poprawka": "Propozycja zmiany w projekcie ustawy zgłaszana podczas prac legislacyjnych.",
    "weto": "Odmowa podpisania ustawy przez Prezydenta. Sejm może odrzucić weto większością 3/5 głosów.",
    "vacatio legis": "Okres między publikacją ustawy w Dzienniku Ustaw a jej wejściem w życie. Standardowo wynosi 14 dni, ale może być dłuższy (np. 6 miesięcy dla skomplikowanych ustaw) lub krótszy dla ustaw pilnych. Ma na celu danie czasu obywatelom i instytucjom na przygotowanie się do nowych przepisów.",
    "druk sejmowy": "Oficjalny dokument zawierający projekt ustawy wraz z uzasadnieniem. Każdy druk ma unikalny numer.",
    "quorum": "Minimalna liczba posłów wymagana do ważności głosowania - połowa ustawowej liczby posłów (230).",
    "większość zwykła": "Więcej głosów 'za' niż 'przeciw' przy zachowanym quorum. Najczęściej stosowana przy uchwalaniu ustaw.",
    "większość bezwzględna": "Więcej niż połowa głosów 'za' przy zachowanym quorum.",
    "większość kwalifikowana": "Określony ułamek głosów, np. 2/3 (zmiana Konstytucji) lub 3/5 (odrzucenie weta).",
    "komisja sejmowa": "Organ Sejmu zajmujący się określoną dziedziną, np. Komisja Finansów Publicznych.",
    "marszałek sejmu": "Przewodniczący Sejmu, kieruje jego pracami, ustala porządek obrad.",
    "kadencja": "Okres pełnienia funkcji przez Sejm - 4 lata. Obecna X kadencja rozpoczęła się w 2023 roku.",
    "dziennik ustaw": "Oficjalny publikator aktów prawnych w Polsce. Ustawy wchodzą w życie po opublikowaniu.",
    "inicjatywa ustawodawcza": "Prawo do zgłoszenia projektu ustawy. Mają je: posłowie (min. 15), Senat, Prezydent, rząd, obywatele (100 tys. podpisów).",
    "rcl": "Rządowe Centrum Legislacji - urząd zapewniający obsługę prawną Rady Ministrów i koordynujący proces legislacyjny rządu.",
    "uzasadnienie": "Dokument dołączony do projektu ustawy wyjaśniający cel i skutki proponowanych zmian.",
    "opinia prawna": "Analiza prawna projektu ustawy przygotowana przez ekspertów Biura Analiz Sejmowych.",
    "konsultacje publiczne": "Etap, w którym obywatele i organizacje mogą zgłaszać uwagi do projektu ustawy.",
    "tryb pilny": "Przyspieszona procedura uchwalania ustaw na wniosek Rady Ministrów.",
    "ustawa budżetowa": "Specjalna ustawa określająca dochody i wydatki państwa na dany rok."
  }
}

// Funkcja do tokenizacji i normalizacji tekstu
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // usuń akcenty
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
}

// Sprawdź czy zapytanie pasuje do tekstu
function matchesQuery(text: string, queryWords: string[]): boolean {
  const textLower = text.toLowerCase()
  const textNormalized = normalizeText(text)
  
  // Sprawdź czy którekolwiek słowo z zapytania pasuje
  return queryWords.some(word => 
    textLower.includes(word) || 
    textNormalized.some(tw => tw.includes(word) || word.includes(tw))
  )
}

// Funkcja do wyszukiwania w bazie wiedzy (ulepszone RAG)
export function searchKnowledge(query: string): string[] {
  const results: string[] = []
  const queryLower = query.toLowerCase()
  const queryWords = normalizeText(query)

  // Szukaj w słowniku (priorytet dla bezpośrednich dopasowań terminów)
  for (const [term, definition] of Object.entries(knowledgeBase.glossary)) {
    const termLower = term.toLowerCase()
    if (
      queryLower.includes(termLower) || 
      termLower.includes(queryLower) ||
      matchesQuery(term, queryWords) ||
      matchesQuery(definition, queryWords)
    ) {
      results.push(`📖 **${term}**: ${definition}`)
    }
  }

  // Szukaj w FAQ
  for (const faq of knowledgeBase.faq) {
    if (
      matchesQuery(faq.question, queryWords) ||
      matchesQuery(faq.answer, queryWords)
    ) {
      results.push(`❓ ${faq.question}\n💡 ${faq.answer}`)
    }
  }

  // Szukaj w etapach procesu
  for (const stage of knowledgeBase.legislativeProcess.stages) {
    if (
      matchesQuery(stage.name, queryWords) ||
      matchesQuery(stage.description, queryWords)
    ) {
      results.push(`📋 **${stage.name}**: ${stage.description}`)
    }
  }

  // Szukaj w typach wnioskodawców
  for (const [type, desc] of Object.entries(knowledgeBase.legislativeProcess.submitterTypes)) {
    if (matchesQuery(type, queryWords) || matchesQuery(desc, queryWords)) {
      results.push(`👤 Projekt ${type}: ${desc}`)
    }
  }

  // Szukaj informacje o instytucjach
  const { sejm, senat, prezydent } = knowledgeBase.legislativeProcess
  if (matchesQuery('sejm', queryWords)) {
    results.push(`🏛️ **Sejm RP**: ${sejm.description}. ${sejm.role}. Kadencja: ${sejm.kadencja}`)
  }
  if (matchesQuery('senat', queryWords)) {
    results.push(`🏛️ **Senat RP**: ${senat.description}. ${senat.role}. Czas na rozpatrzenie: ${senat.czasNaRozpatrzenie}`)
  }
  if (matchesQuery('prezydent weto', queryWords)) {
    results.push(`🏛️ **Prezydent RP**: ${prezydent.description}. Weto: ${prezydent.weto}`)
  }

  // Szukaj w funkcjach aplikacji
  for (const feature of knowledgeBase.app.features) {
    if (matchesQuery(feature, queryWords)) {
      results.push(`✨ Funkcja: ${feature}`)
    }
  }

  // Szukaj w nawigacji
  for (const [name, desc] of Object.entries(knowledgeBase.app.navigation)) {
    if (matchesQuery(name, queryWords) || matchesQuery(desc, queryWords)) {
      results.push(`🧭 **${name}**: ${desc}`)
    }
  }

  // Usuń duplikaty
  return [...new Set(results)]
}

// Budowanie kontekstu dla AI
export function buildContext(query: string): string {
  const relevantInfo = searchKnowledge(query)
  
  let context = `Jesteś pomocnym asystentem aplikacji "Ścieżka Prawa" - polskiego trackera legislacyjnego.
  
WAŻNE ZASADY:
- Odpowiadaj WYŁĄCZNIE po polsku
- Bądź zwięzły, ale pomocny
- Używaj emoji dla lepszej czytelności
- Formatuj odpowiedzi z użyciem Markdown (pogrubienia, listy)
- Jeśli użytkownik pyta o termin, który znasz, odpowiedz BEZPOŚREDNIO definicją
- Nie mów że "nie wiesz" jeśli informacja jest w kontekście poniżej

INFORMACJE O APLIKACJI:
${knowledgeBase.app.description}
Główne funkcje: ${knowledgeBase.app.features.join(', ')}

PROCES LEGISLACYJNY W POLSCE:
${knowledgeBase.legislativeProcess.overview}

ETAPY PROCESU:
${knowledgeBase.legislativeProcess.stages.map(s => `- ${s.name}: ${s.description}`).join('\n')}

TYPY PROJEKTÓW:
${Object.entries(knowledgeBase.legislativeProcess.submitterTypes).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

SŁOWNIK TERMINÓW:
${Object.entries(knowledgeBase.glossary).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

INFORMACJE O SEJMIE:
${knowledgeBase.legislativeProcess.sejm.description}. ${knowledgeBase.legislativeProcess.sejm.role}

INFORMACJE O SENACIE:
${knowledgeBase.legislativeProcess.senat.description}. ${knowledgeBase.legislativeProcess.senat.role}

FAQ:
${knowledgeBase.faq.map(f => `P: ${f.question}\nO: ${f.answer}`).join('\n\n')}
`

  if (relevantInfo.length > 0) {
    context += `\n\nNAJBARDZIEJ RELEWANTNE INFORMACJE DLA TEGO PYTANIA:
${relevantInfo.slice(0, 5).join('\n\n')}
`
  }

  context += `\n\nOdpowiedz na pytanie użytkownika korzystając z powyższych informacji. Bądź konkretny i pomocny.`

  return context
}
