import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, mode = 'explain' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    let systemPrompt = ''
    
    switch (mode) {
      case 'simple':
        systemPrompt = `Jesteś ekspertem od komunikacji w prostym języku dla obywateli. Twoim zadaniem jest przepisanie tekstu ustawy/dokumentu prawnego na prosty, zrozumiały język.

ZASADY PROSTEGO JĘZYKA:
• Używaj krótkich zdań (15-20 słów)
• Unikaj żargonu prawniczego lub wyjaśniaj terminy
• Używaj języka aktywnego ("musisz", "możesz") zamiast biernego
• Dziel informacje na punkty
• Używaj konkretnych przykładów

STRUKTURA ODPOWIEDZI:
1. **Co to oznacza?** - główna idea prostym językiem
2. **Kogo to dotyczy?** - kto jest objęty regulacją
3. **Co musisz wiedzieć?** - kluczowe informacje w punktach
4. **Przykład** - konkretna sytuacja życiowa (jeśli możliwe)

Przepisz poniższy tekst prawny:`
        break
        
      case 'impact':
        systemPrompt = `Jesteś ekspertem od analizy skutków regulacji prawnych. Przeanalizuj tekst ustawy i przedstaw jej skutki w prosty sposób.

STRUKTURA ANALIZY SKUTKÓW:
1. **Dla obywateli** 👥
   • Jak to wpłynie na życie codzienne?
   • Jakie nowe prawa lub obowiązki?
   
2. **Dla firm/przedsiębiorców** 🏢
   • Jakie zmiany w prowadzeniu działalności?
   • Nowe wymogi czy koszty?
   
3. **Dla budżetu państwa** 💰
   • Szacowane koszty wdrożenia
   • Potencjalne oszczędności lub dochody
   
4. **Terminy** 📅
   • Kiedy wchodzi w życie?
   • Czy są okresy przejściowe?

5. **Kontrowersje** ⚠️
   • Potencjalne problemy
   • Kto może być przeciwny i dlaczego?

Przeanalizuj poniższy tekst:`
        break
        
      case 'summary':
        systemPrompt = `Jesteś ekspertem od streszczania dokumentów prawnych. Stwórz zwięzłe, praktyczne streszczenie.

STRUKTURA STRESZCZENIA:
1. **W skrócie** (1-2 zdania - esencja)
2. **Główne punkty** (3-5 punktów)
3. **Kogo dotyczy** (kto jest bezpośrednio objęty)
4. **Kiedy** (daty, terminy)
5. **Co dalej** (następne kroki w procesie legislacyjnym)

Bądź zwięzły ale kompletny. Streszczenie powinno zajmować max 200 słów.

Podsumuj poniższy tekst:`
        break
        
      default: // 'explain'
        systemPrompt = `Jesteś ekspertem prawnym, który wyjaśnia przepisy w przystępny sposób. Wyjaśnij poniższy tekst prawny tak, aby zrozumiał go przeciętny obywatel.

ZASADY:
• Używaj prostego języka
• Wyjaśniaj terminy prawnicze
• Podawaj praktyczne przykłady
• Dziel na sekcje z nagłówkami
• Używaj emoji dla lepszej czytelności (np. ⚖️ 📋 💡)

Wyjaśnij poniższy tekst:`
    }

    if (!apiKey) {
      // Fallback bez API - podstawowa analiza
      let response = ''
      
      switch (mode) {
        case 'simple':
          response = `**Co to oznacza?**\n\n${text.substring(0, 200)}...\n\n**Uwaga:** Ta funkcja wymaga konfiguracji API dla pełnej analizy. Prosimy o kontakt z administratorem.`
          break
        case 'impact':
          response = `**Analiza skutków**\n\n📋 **Podstawowe informacje:**\n${text.substring(0, 200)}...\n\n⚠️ **Uwaga:** Szczegółowa analiza skutków wymaga konfiguracji API. Prosimy o kontakt z administratorem.`
          break
        case 'summary':
          response = `**Streszczenie:**\n\n${text.substring(0, 150)}...\n\n_Funkcja pełnego streszczania wymaga konfiguracji API._`
          break
        default:
          response = `**Wyjaśnienie:**\n\n${text}\n\n_Szczegółowe wyjaśnienia wymagają konfiguracji API._`
      }
      
      return NextResponse.json({ response })
    }

    // Użyj Gemini API - używamy gemini-flash-latest
    console.log('[Simple Language API] Processing with mode:', mode, 'Text length:', text.length)
    
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `\n\n${text}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      }
    )

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error('[Simple Language API] Gemini API error:', apiResponse.status, errorText)
      throw new Error(`Gemini API error: ${apiResponse.status} - ${errorText}`)
    }

    const data = await apiResponse.json()
    console.log('[Simple Language API] Response received, candidates:', data.candidates?.length)
    
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Przepraszam, nie udało się przetworzyć tekstu.'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[Simple Language API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process text',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
