import { NextRequest, NextResponse } from 'next/server'
import { buildContext, searchKnowledge } from '@/lib/ai/knowledge-base'

function generateLocalResponse(query: string): string {
  const queryLower = query.toLowerCase()
  
  // Najpierw szukaj w bazie wiedzy
  const results = searchKnowledge(query)
  
  if (results.length > 0) {
    // Jeśli znaleziono wyniki, zwróć je w ładnym formacie
    const formattedResults = results.slice(0, 3).join('\n\n')
    return `${formattedResults}\n\nCzy mogę pomóc w czymś jeszcze?`
  }

  // Odpowiedzi na typowe pytania
  if (queryLower.includes('cześć') || queryLower.includes('hej') || queryLower.includes('witaj') || queryLower.includes('siema')) {
    return 'Witaj! 🦅 Jestem asystentem Ścieżki Prawa. Mogę pomóc Ci zrozumieć proces legislacyjny w Polsce lub wyjaśnić jak działa ta aplikacja. O co chcesz zapytać?'
  }

  if (queryLower.includes('dzięki') || queryLower.includes('dziękuję') || queryLower.includes('thx')) {
    return 'Nie ma za co! 😊 Jeśli masz więcej pytań o proces legislacyjny lub działanie aplikacji, chętnie pomogę.'
  }

  if ((queryLower.includes('jak') && queryLower.includes('działa')) || queryLower.includes('co to za aplikacja')) {
    return 'Ścieżka Prawa to aplikacja do śledzenia procesu legislacyjnego w Polsce. Możesz:\n\n• 📋 Przeglądać projekty ustaw z oficjalnego API Sejmu\n• 🔍 Wyszukiwać po tytule, opisie lub numerze\n• 🏷️ Filtrować po statusie, roku, kadencji\n• ⭐ Zapisywać ulubione projekty\n• 🔔 Otrzymywać powiadomienia o zmianach\n\nCzy chcesz dowiedzieć się więcej o konkretnej funkcji?'
  }

  if (queryLower.includes('proces') && queryLower.includes('legislacyj')) {
    return 'Proces legislacyjny w Polsce składa się z kilku etapów:\n\n1️⃣ **Projekt** - przygotowanie przez wnioskodawcę\n2️⃣ **I czytanie** - prezentacja w Sejmie\n3️⃣ **Komisja** - szczegółowe prace\n4️⃣ **II czytanie** - sprawozdanie komisji\n5️⃣ **III czytanie** - głosowanie\n6️⃣ **Senat** - rozpatrzenie przez izbę wyższą\n7️⃣ **Prezydent** - podpis lub weto\n8️⃣ **Publikacja** - wejście w życie\n\nCzy chcesz wiedzieć więcej o którymś etapie?'
  }

  if (queryLower.includes('sejm') && !queryLower.includes('senat')) {
    return '🏛️ **Sejm RP** to izba niższa polskiego parlamentu, składająca się z 460 posłów wybieranych na 4-letnią kadencję.\n\nGłówne zadania:\n• Uchwalanie ustaw\n• Kontrolowanie rządu\n• Uchwalanie budżetu państwa\n\nObecna X kadencja rozpoczęła się w 2023 roku.'
  }

  if (queryLower.includes('senat')) {
    return '🏛️ **Senat RP** to izba wyższa parlamentu, składająca się ze 100 senatorów.\n\nRozpatruje ustawy uchwalone przez Sejm i może:\n• ✅ Przyjąć bez zmian\n• 📝 Wprowadzić poprawki\n• ❌ Odrzucić w całości\n\nMa na to zwykle 30 dni (14 dni dla ustaw pilnych).'
  }

  if (queryLower.includes('weto') || (queryLower.includes('prezydent') && queryLower.includes('ustaw'))) {
    return '🏛️ **Prezydent RP** ma 21 dni na podjęcie decyzji w sprawie ustawy. Może:\n\n✅ **Podpisać** ustawę - wchodzi w życie po publikacji\n❌ **Zawetować** - Sejm może odrzucić weto większością 3/5 głosów\n⚖️ **Skierować do TK** - Trybunał bada zgodność z Konstytucją\n\nJeśli nie podejmie działania w ciągu 21 dni, ustawa jest uznana za podpisaną.'
  }

  if (queryLower.includes('szukać') || queryLower.includes('wyszuk') || queryLower.includes('znaleźć')) {
    return 'Aby znaleźć interesującą Cię ustawę:\n\n🔍 Użyj wyszukiwarki w górnym pasku\n📋 Przejdź do zakładki "Wyszukiwarka" w menu\n🏷️ Filtruj po statusie, roku, wnioskodawcy, kadencji\n\nWyszukiwarka przeszukuje tytuły, opisy i numery projektów ustaw.'
  }

  if (queryLower.includes('powiadomien') || queryLower.includes('alert') || queryLower.includes('śledzić')) {
    return 'Aby śledzić ustawę i otrzymywać powiadomienia:\n\n1. Znajdź interesującą Cię ustawę\n2. Kliknij ikonę dzwonka 🔔\n3. Gotowe! Otrzymasz powiadomienie gdy zmieni się status\n\nWszystkie alerty znajdziesz w zakładce "Powiadomienia".'
  }

  if (queryLower.includes('zapisać') || queryLower.includes('ulubion') || queryLower.includes('zakładk')) {
    return 'Aby zapisać ustawę do ulubionych:\n\n1. Znajdź interesującą Cię ustawę\n2. Kliknij ikonę zakładki ⭐\n3. Wszystkie zapisane projekty znajdziesz w zakładce "Zapisane"'
  }

  if (queryLower.includes('ciemny') || queryLower.includes('motyw') || queryLower.includes('tryb')) {
    return 'Możesz zmienić motyw aplikacji:\n\n☀️ **Jasny** - domyślny motyw\n🌙 **Ciemny** - wygodny dla oczu\n🖥️ **Systemowy** - dostosowany do ustawień systemu\n\nPrzełącznik znajdziesz na dole panelu bocznego lub w Ustawieniach.'
  }

  // Domyślna odpowiedź
  return 'Przepraszam, nie jestem pewien jak odpowiedzieć na to pytanie. Mogę pomóc z:\n\n• 📜 Procesem legislacyjnym w Polsce\n• 📱 Działaniem aplikacji Ścieżka Prawa\n• 🔍 Wyszukiwaniem ustaw\n• 🔔 Powiadomieniami i ustawieniami\n• 📖 Wyjaśnieniem terminów prawnych\n\nSpróbuj zapytać bardziej szczegółowo!'
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy mamy klucz API Gemini
    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey) {
      // Użyj Gemini API
      const context = buildContext(message)
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: context },
                  { text: `\n\nPytanie użytkownika: ${message}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
              topP: 0.8,
              topK: 40
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      )

      if (!response.ok) {
        console.error('Gemini API error:', await response.text())
        // Fallback to local response
        return NextResponse.json({ response: generateLocalResponse(message) })
      }

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (aiResponse) {
        return NextResponse.json({ response: aiResponse })
      }
    }

    // Fallback - użyj lokalnej bazy wiedzy
    const localResponse = generateLocalResponse(message)
    return NextResponse.json({ response: localResponse })

  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { response: 'Przepraszam, wystąpił błąd. Spróbuj ponownie za chwilę.' },
      { status: 500 }
    )
  }
}
