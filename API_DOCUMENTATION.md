# 📡 API Documentation - Faza 1

## Nowy Endpoint: Prosty Język

### `POST /api/ai/simple-language`

Przetwarza tekst prawny na prosty język lub generuje różne typy analiz.

---

## Request

### Endpoint
```
POST /api/ai/simple-language
```

### Headers
```
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | **Yes** | Tekst do przetworzenia (opis ustawy, artykuł, etc.) |
| `mode` | string | No | Tryb przetwarzania: `simple`, `impact`, `summary`, `explain` (default: `explain`) |

### Example Request

```bash
curl -X POST http://localhost:3000/api/ai/simple-language \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Art. 1. Ustawa reguluje zasady cyfryzacji administracji publicznej...",
    "mode": "simple"
  }'
```

```javascript
// JavaScript/TypeScript
const response = await fetch('/api/ai/simple-language', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Treść ustawy...",
    mode: "impact"
  })
})

const data = await response.json()
console.log(data.response)
```

---

## Response

### Success Response (200 OK)

```json
{
  "response": "**Co to oznacza?**\n\nUstawa wprowadza nowe zasady cyfryzacji..."
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "Text is required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to process text"
}
```

---

## Tryby Działania

### 1. `simple` - Prosty Język

Przepisuje tekst prawny na zrozumiały język.

**Struktura odpowiedzi:**
- Co to oznacza?
- Kogo to dotyczy?
- Co musisz wiedzieć?
- Przykład

**Przykład:**
```json
{
  "text": "Art. 5. Minister właściwy do spraw cyfryzacji...",
  "mode": "simple"
}
```

**Odpowiedź:**
```markdown
**Co to oznacza?**

Minister Cyfryzacji może wydawać przepisy dotyczące...

**Kogo to dotyczy?**

Wszystkich obywateli korzystających z usług cyfrowych...

**Co musisz wiedzieć?**

• Nowe przepisy wchodzą w życie...
• Możesz złożyć wniosek...
• W razie problemów...

**Przykład**

Jeśli chcesz założyć profil zaufany...
```

---

### 2. `impact` - Analiza Skutków

Analizuje wpływ ustawy na różne grupy.

**Struktura odpowiedzi:**
- Dla obywateli 👥
- Dla firm/przedsiębiorców 🏢
- Dla budżetu państwa 💰
- Terminy 📅
- Kontrowersje ⚠️

**Przykład:**
```json
{
  "text": "Ustawa o cyfryzacji wprowadza obowiązek...",
  "mode": "impact"
}
```

**Odpowiedź:**
```markdown
**Dla obywateli** 👥

• Łatwiejszy dostęp do usług online
• Nowe możliwości załatwienia spraw z domu
• Wymagane będzie konto w systemie...

**Dla firm/przedsiębiorców** 🏢

• Obowiązek wdrożenia nowych systemów
• Szacowany koszt: 10-50 tys. zł
• Okres przejściowy: 12 miesięcy

**Dla budżetu państwa** 💰

• Koszt wdrożenia: 500 mln zł
• Oczekiwane oszczędności: 200 mln zł rocznie...
```

---

### 3. `summary` - Streszczenie

Zwięzłe podsumowanie (max 200 słów).

**Struktura odpowiedzi:**
- W skrócie
- Główne punkty
- Kogo dotyczy
- Kiedy
- Co dalej

**Przykład:**
```json
{
  "text": "Długi tekst ustawy...",
  "mode": "summary"
}
```

---

### 4. `explain` - Wyjaśnienie (default)

Szczegółowe wyjaśnienie przepisów z przykładami.

**Przykład:**
```json
{
  "text": "Art. 10. Użytkownik ma prawo do...",
  "mode": "explain"
}
```

---

## Rate Limiting

Obecnie brak rate limitingu, ale w produkcji zaleca się:
- Max 10 requestów/minutę na IP
- Max 100 requestów/dzień na użytkownika

---

## Konfiguracja

### Zmienne środowiskowe

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key  # Opcjonalne
```

### Bez API Key

Jeśli `GEMINI_API_KEY` nie jest ustawiony, endpoint zwraca fallback:

```json
{
  "response": "**Uwaga:** Ta funkcja wymaga konfiguracji API..."
}
```

---

## Bezpieczeństwo

### Co jest bezpieczne:
- ✅ Tekst jest walidowany (max length)
- ✅ Żadne dane nie są zapisywane permanentnie
- ✅ API key jest w zmiennych środowiskowych

### Co należy dodać w produkcji:
- 🔒 Autentykacja użytkownika
- 🔒 Rate limiting
- 🔒 Input sanitization (przeciw injection attacks)
- 🔒 Logging requestów
- 🔒 CORS policy

---

## Cache'owanie

### W bazie danych

W przyszłości wyniki będą cache'owane w polu `simple_language_summary`:

```sql
UPDATE bills
SET simple_language_summary = 'Wynik z AI...'
WHERE id = 'xxx';
```

### W przeglądarce

Frontend cache'uje wyniki w komponencie (React state).

---

## Monitoring

### Jak monitorować:

```javascript
// Dodaj w route.ts
console.log('[Simple Language API]', {
  mode,
  textLength: text.length,
  timestamp: new Date(),
  hasApiKey: !!process.env.GEMINI_API_KEY
})
```

### Metryki do śledzenia:
- Liczba requestów per tryb
- Średni czas odpowiedzi
- Success rate
- Długość tekstów wejściowych

---

## Przykłady Integracji

### React Component

```tsx
'use client'

import { useState } from 'react'

export function SimpleLanguageDemo() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/simple-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Tekst ustawy...",
          mode: "simple"
        })
      })
      const data = await res.json()
      setResult(data.response)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? 'Przetwarzam...' : 'Przetłumacz'}
      </button>
      {result && <div>{result}</div>}
    </div>
  )
}
```

### Server Action

```tsx
'use server'

export async function translateToSimpleLanguage(text: string) {
  const response = await fetch('http://localhost:3000/api/ai/simple-language', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, mode: 'simple' })
  })
  
  return await response.json()
}
```

---

## Testing

### Unit Test

```typescript
import { POST } from '@/app/api/ai/simple-language/route'

describe('Simple Language API', () => {
  it('should process text in simple mode', async () => {
    const request = new Request('http://localhost:3000/api/ai/simple-language', {
      method: 'POST',
      body: JSON.stringify({
        text: 'Test text',
        mode: 'simple'
      })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(data.response).toBeDefined()
  })
})
```

### Manual Test

```bash
# Test simple mode
curl -X POST http://localhost:3000/api/ai/simple-language \
  -H "Content-Type: application/json" \
  -d '{"text":"Artykuł 1. Test","mode":"simple"}'

# Test impact mode
curl -X POST http://localhost:3000/api/ai/simple-language \
  -H "Content-Type: application/json" \
  -d '{"text":"Artykuł 1. Test","mode":"impact"}'
```

---

## Changelog

### v1.0.0 (6 grudnia 2025)
- ✨ Initial release
- ✨ 4 tryby: simple, impact, summary, explain
- ✨ Integracja z Gemini 2.0 Flash
- ✨ Fallback bez API key

---

## Roadmap

### Faza 2 (planowane):
- 💾 Cache'owanie wyników w DB
- 🔐 Autentykacja i rate limiting
- 📊 Analytics i monitoring
- 🌐 Wsparcie dla wielu języków
- 🎨 Custom prompts dla różnych typów dokumentów

---

**Pytania?** Sprawdź plik `FAZA1_COMPLETED.md`
