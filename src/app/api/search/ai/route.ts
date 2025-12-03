import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Mapowanie kategorii - klucze odpowiadają wartościom w bazie danych
const categoryMap: Record<string, string[]> = {
  'finanse': ['podatek', 'budżet', 'finanse', 'ekonom', 'gospodar', 'bank', 'walut', 'kredyt', 'pożyczk', 'pieniądz', 'vat', 'pit', 'cit'],
  'prawo_karne': ['karn', 'przestępst', 'więzieni', 'skazani', 'wyrok', 'prokurator'],
  'prawo_cywilne': ['cywil', 'małżeńst', 'spadk', 'własnoś', 'umow'],
  'zdrowie': ['zdrow', 'medyc', 'lekarz', 'szpital', 'chorob', 'leczeni', 'farmac', 'szczepion', 'pacjent'],
  'edukacja': ['edukacj', 'szkoł', 'nauczyciel', 'student', 'uniwersytet', 'kształceni', 'oświat', 'uczeń'],
  'środowisko': ['środowisk', 'ekolog', 'klimat', 'zanieczyszcz', 'odpady', 'recykl', 'las', 'wod', 'powietrz', 'emisj'],
  'obronność': ['wojsk', 'obron', 'armia', 'żołnierz', 'siły zbrojne'],
  'cyfryzacja': ['cyfr', 'internet', 'komputer', 'elektron', 'online', 'dane osobowe', 'cyber'],
  'transport': ['transport', 'drog', 'kolej', 'samochod', 'lotnisk', 'komunikacj', 'autobus', 'kierowca'],
  'praca_społeczna': ['prac', 'zatrudnieni', 'emeryt', 'rent', 'wynagrodzeni', 'urlop', 'związk', 'bezroboc', 'zasiłek'],
  'rolnictwo': ['rolnic', 'rolnik', 'upraw', 'hodowl', 'żywnoś', 'ziemi rolna'],
  'samorząd': ['samorząd', 'gmin', 'powiat', 'wojewód', 'rada miejsk', 'burmistrz', 'wójt'],
}

// Mapowanie statusów
const statusMap: Record<string, string[]> = {
  'draft': ['projekt', 'nowy', 'przygotow'],
  'submitted': ['złożon', 'wpłyn'],
  'first_reading': ['pierwsze czytanie', 'i czytanie', '1 czytanie'],
  'committee': ['komisj', 'prace w komisji'],
  'second_reading': ['drugie czytanie', 'ii czytanie', '2 czytanie'],
  'third_reading': ['trzecie czytanie', 'iii czytanie', '3 czytanie'],
  'senate': ['senat'],
  'presidential': ['prezydent', 'podpis'],
  'published': ['opublikowan', 'dziennik ustaw', 'obowiązuj', 'uchwalon'],
  'rejected': ['odrzucon', 'odrzucen'],
}

// Mapowanie typu wnioskodawcy - wartości zgodne z bazą danych
const submitterMap: Record<string, string[]> = {
  'rządowy': ['rząd', 'rządow', 'ministerst', 'rada ministrów', 'minister'],
  'poselski': ['posel', 'posłow', 'poseł', 'klub parlamentarny'],
  'senacki': ['senat', 'senator'],
  'obywatelski': ['obywatel', 'inicjatywa obywatelska'],
  'prezydencki': ['prezydent', 'prezydenc'],
  'komisyjny': ['komisj'],
}

async function analyzeQueryWithAI(query: string): Promise<{
  keywords: string[]
  category: string | null
  status: string | null
  submitterType: string | null
  dateFrom: string | null
  dateTo: string | null
}> {
  if (!GEMINI_API_KEY) {
    // Fallback do prostej analizy bez AI
    return analyzeQuerySimple(query)
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Przeanalizuj poniższe zapytanie użytkownika szukającego polskich ustaw i projektów ustaw.
Wyodrębnij:
1. Słowa kluczowe (keywords) - najważniejsze słowa do wyszukiwania w tytułach ustaw
2. Kategorię (category) - jedna z: finanse, prawo_karne, prawo_cywilne, zdrowie, edukacja, środowisko, obronność, cyfryzacja, transport, praca_społeczna, rolnictwo, samorząd, lub null
3. Status ustawy (status) - jeden z: draft, submitted, first_reading, committee, second_reading, third_reading, senate, presidential, published, rejected, lub null
4. Typ wnioskodawcy (submitterType) - jeden z: rządowy, poselski, senacki, obywatelski, prezydencki, komisyjny, lub null
5. Data od (dateFrom) - w formacie YYYY-MM-DD lub null
6. Data do (dateTo) - w formacie YYYY-MM-DD lub null

Zapytanie: "${query}"

Odpowiedz TYLKO w formacie JSON bez żadnych dodatkowych znaków:
{"keywords":["słowo1","słowo2"],"category":null,"status":null,"submitterType":null,"dateFrom":null,"dateTo":null}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          }
        })
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Wyciągnij JSON z odpowiedzi
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        keywords: parsed.keywords || [],
        category: parsed.category || null,
        status: parsed.status || null,
        submitterType: parsed.submitterType || null,
        dateFrom: parsed.dateFrom || null,
        dateTo: parsed.dateTo || null,
      }
    }
  } catch (error) {
    console.error('AI analysis error:', error)
  }

  // Fallback do prostej analizy
  return analyzeQuerySimple(query)
}

function analyzeQuerySimple(query: string): {
  keywords: string[]
  category: string | null
  status: string | null
  submitterType: string | null
  dateFrom: string | null
  dateTo: string | null
} {
  const lowerQuery = query.toLowerCase()
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 2)
  
  // Znajdź kategorię
  let category: string | null = null
  for (const [cat, patterns] of Object.entries(categoryMap)) {
    if (patterns.some(p => lowerQuery.includes(p))) {
      category = cat
      break
    }
  }

  // Znajdź status
  let status: string | null = null
  for (const [stat, patterns] of Object.entries(statusMap)) {
    if (patterns.some(p => lowerQuery.includes(p))) {
      status = stat
      break
    }
  }

  // Znajdź typ wnioskodawcy
  let submitterType: string | null = null
  for (const [sub, patterns] of Object.entries(submitterMap)) {
    if (patterns.some(p => lowerQuery.includes(p))) {
      submitterType = sub
      break
    }
  }

  // Znajdź daty (proste rozpoznawanie roku)
  let dateFrom: string | null = null
  let dateTo: string | null = null
  const yearMatch = lowerQuery.match(/20\d{2}/)
  if (yearMatch) {
    const year = yearMatch[0]
    if (lowerQuery.includes('od') || lowerQuery.includes('po')) {
      dateFrom = `${year}-01-01`
    } else if (lowerQuery.includes('do') || lowerQuery.includes('przed')) {
      dateTo = `${year}-12-31`
    } else {
      dateFrom = `${year}-01-01`
      dateTo = `${year}-12-31`
    }
  }

  // Filtruj słowa kluczowe (usuń stop words)
  const stopWords = ['ustawy', 'ustawa', 'projekt', 'projekty', 'dotyczące', 'dotyczący', 'sprawie', 'roku', 'która', 'które', 'który', 'oraz', 'lub', 'dla', 'przy', 'przez']
  const keywords = words.filter(w => !stopWords.includes(w) && w.length > 2)

  return {
    keywords,
    category,
    status,
    submitterType,
    dateFrom,
    dateTo,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Brak zapytania' }, { status: 400 })
    }

    // Analizuj zapytanie
    const analysis = await analyzeQueryWithAI(query)

    // Buduj zapytanie do bazy
    const supabase = await createClient()
    
    // Najpierw spróbuj wyszukać po tekście (bez filtrów strukturalnych)
    // To da lepsze wyniki niż restrykcyjne filtrowanie
    const { data: allBills, error } = await supabase
      .from('bills')
      .select('*')
      .eq('is_hidden', false)
      .order('last_updated', { ascending: false })
      .limit(200)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Błąd wyszukiwania' }, { status: 500 })
    }

    let filteredBills = allBills || []

    // Wyszukiwanie tekstowe - dopasuj po słowach kluczowych lub samym zapytaniu
    const searchTerms = analysis.keywords.length > 0 
      ? analysis.keywords 
      : query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    
    if (searchTerms.length > 0) {
      filteredBills = filteredBills.filter(bill => {
        const text = `${bill.title} ${bill.description || ''} ${bill.tags?.join(' ') || ''}`.toLowerCase()
        // Dopasuj jeśli KTÓRYKOLWIEK termin pasuje
        return searchTerms.some(term => text.includes(term.toLowerCase()))
      })
    }

    // Opcjonalne filtrowanie po strukturze - stosuj tylko jeśli dało wyniki
    // lub jeśli wyniki są zbyt liczne
    if (filteredBills.length > 10) {
      // Filtruj po kategorii
      if (analysis.category) {
        const categoryFiltered = filteredBills.filter(bill => bill.category === analysis.category)
        if (categoryFiltered.length > 0) {
          filteredBills = categoryFiltered
        }
      }

      // Filtruj po typie wnioskodawcy
      if (analysis.submitterType && filteredBills.length > 5) {
        const submitterFiltered = filteredBills.filter(bill => bill.submitter_type === analysis.submitterType)
        if (submitterFiltered.length > 0) {
          filteredBills = submitterFiltered
        }
      }

      // Filtruj po statusie
      if (analysis.status && filteredBills.length > 5) {
        const statusFiltered = filteredBills.filter(bill => bill.status === analysis.status)
        if (statusFiltered.length > 0) {
          filteredBills = statusFiltered
        }
      }
    }

    // Filtruj po dacie (zawsze stosuj jeśli podano)
    if (analysis.dateFrom) {
      filteredBills = filteredBills.filter(bill => 
        bill.submission_date && bill.submission_date >= analysis.dateFrom!
      )
    }
    if (analysis.dateTo) {
      filteredBills = filteredBills.filter(bill => 
        bill.submission_date && bill.submission_date <= analysis.dateTo!
      )
    }

    // Ogranicz wyniki do 20
    filteredBills = filteredBills.slice(0, 20)

    return NextResponse.json({
      results: filteredBills,
      analysis: {
        keywords: analysis.keywords,
        category: analysis.category,
        status: analysis.status,
        submitterType: analysis.submitterType,
        dateFrom: analysis.dateFrom,
        dateTo: analysis.dateTo,
      },
      totalResults: filteredBills.length,
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
