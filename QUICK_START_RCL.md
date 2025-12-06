# Quick Start - Nowe Funkcje RCL

## 🚀 Dla Użytkowników

### 1. Przeglądaj Konsultacje

Przejdź do: **Menu → Konsultacje**

Lub bezpośrednio: `http://localhost:3000/consultations`

**Co zobaczysz:**
- ✅ Aktywne konsultacje społeczne
- ✅ Aktywne prekonsultacje
- ✅ Nadchodzące konsultacje
- ✅ Historia zakończonych konsultacji

**Filtry:**
- Typ: Wszystkie / Prekonsultacje / Konsultacje
- Ministerstwo: Wybierz z listy

### 2. Ustaw Alert dla Ustawy

Na stronie dowolnej ustawy:

1. Kliknij przycisk **"Ustaw alert"** lub ikonę dzwonka 🔔
2. Wybierz rodzaj powiadomień:
   - ✅ Email
   - ✅ Push (wkrótce)
3. Kliknij **"Utwórz alert"**

**Będziesz otrzymywać powiadomienia gdy:**
- Ustawa zmieni status
- Rozpoczną się konsultacje
- Zostanie opublikowana OCR
- Nastąpi głosowanie

### 3. Sprawdź Ocenę Skutków Regulacji (OSR)

Na stronie ustawy → Zakładka **"Ocena Skutków"**

**Zobaczysz:**
- 💰 **Wpływ Finansowy:** Budżet państwa, obywatele, przedsiębiorcy
- 👥 **Wpływ Społeczny:** Grupy dotknięte, pozytywne/negatywne efekty
- 📈 **Wpływ Gospodarczy:** PKB, zatrudnienie, konkurencyjność
- 🌱 **Wpływ Środowiskowy:** Klimat, biodiversity, zasoby
- ⚖️ **Wpływ Prawny:** Konfliktujące regulacje, obciążenia

### 4. Zobacz Ścieżkę Legislacyjną (Legislative Train)

Na stronie ustawy → automatycznie wyświetlane u góry

**12 etapów:**
1. Współtworzenie
2. Prekonsultacje
3. Projekt
4. Konsultacje
5. Złożony
6. I Czytanie
7. Komisja
8. II Czytanie
9. III Czytanie
10. Senat
11. Prezydent
12. Opublikowana

**Oznaczenia:**
- ✅ Zielone = Zakończone
- 🔵 Niebieskie (pulsujące) = Obecny etap
- ⚪ Szare = Przyszłe etapy

---

## 🔧 Dla Administratorów

### Pierwsza Synchronizacja

**Krok 1: Zaloguj się jako admin**

```
Email: admin@example.com
Role: admin lub super_admin
```

**Krok 2: Uruchom synchronizację RCL**

Opcja A - Panel Admin:
1. Menu → **Admin** → **Synchronizacja RCL**
2. Kliknij **"Synchronizuj teraz"**

Opcja B - API:
```bash
curl -X POST http://localhost:3000/api/admin/sync-rcl-enhanced \
  -H "Cookie: your-session-cookie"
```

**Krok 3: Sprawdź wyniki**

Powinieneś zobaczyć:
```json
{
  "success": true,
  "results": {
    "rclProjects": 45,
    "consultations": 12,
    "billsUpdated": 23,
    "billsCreated": 5
  }
}
```

**Krok 4: Weryfikacja**

1. Przejdź do `/consultations`
2. Sprawdź czy widać aktywne konsultacje
3. Otwórz dowolną ustawę → sprawdź czy ma RCL ID

---

## 📊 Dane Testowe

### Przykładowe Zapytania SQL

**Znajdź aktywne konsultacje:**
```sql
SELECT title, status, consultation_start_date, consultation_end_date
FROM bills
WHERE status IN ('preconsultation', 'consultation')
  AND consultation_end_date > NOW()
ORDER BY consultation_start_date DESC;
```

**Sprawdź alerty użytkowników:**
```sql
SELECT 
  u.email,
  b.title,
  a.notify_email,
  a.notify_push
FROM user_alerts a
JOIN auth.users u ON a.user_id = u.id
JOIN bills b ON a.bill_id = b.id
WHERE a.is_active = true;
```

**Statystyki integracji RCL:**
```sql
SELECT 
  COUNT(*) as total_bills,
  COUNT(rcl_id) as with_rcl,
  COUNT(impact_assessment_url) as with_osr,
  COUNT(consultation_url) as with_consultations
FROM bills;
```

---

## 🎯 Use Cases

### Use Case 1: Obywatel śledzący reformę podatkową

1. Wchodzi na `/consultations`
2. Filtruje po "Ministerstwo Finansów"
3. Znajduje projekt ustawy podatkowej
4. Klika "Weź udział w konsultacjach"
5. Ustawia alert email
6. Sprawdza OSR → widzi wpływ na portfel
7. Dostaje powiadomienie gdy ustawa przejdzie do Sejmu

### Use Case 2: NGO monitorujące środowisko

1. Wchodzi na `/bills`
2. Filtruje po "środowisko" + status "prekonsultacje"
3. Dla każdej ustawy:
   - Ustawia alert
   - Sprawdza OSR → wpływ środowiskowy
   - Pobiera linki do konsultacji
4. Organizuje zgłoszenia w konsultacjach

### Use Case 3: Przedsiębiorca IT

1. Wchodzi na `/consultations`
2. Filtruje "Ministerstwo Cyfryzacji"
3. Znajduje projekt o AI
4. Sprawdza OSR → wpływ na przedsiębiorców
5. Widzi koszt: "500 tys PLN rocznie dla firm IT"
6. Uczestniczy w konsultacjach
7. Dostaje alert gdy projekt idzie do głosowania

---

## 🐛 Częste Problemy

### Problem: Brak konsultacji na stronie

**Rozwiązanie:**
1. Sprawdź czy była synchronizacja RCL (admin)
2. Sprawdź logi: `[RCL Enhanced Sync]` w konsoli
3. Uruchom sync ponownie

### Problem: Nie mogę ustawić alertu

**Możliwe przyczyny:**
- ❌ Nie jesteś zalogowany → Zaloguj się
- ❌ Alert już istnieje → Sprawdź `/alerts`
- ❌ Błąd API → Sprawdź console devtools

**Rozwiązanie:**
```javascript
// W konsoli przeglądarki:
fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    billId: 'YOUR_BILL_ID',
    notifyEmail: true
  })
}).then(r => r.json()).then(console.log)
```

### Problem: OSR nie wyświetla się

**Przyczyna:** Nie wszystkie projekty mają jeszcze OSR

**Co zrobić:**
1. Sprawdź czy `impact_assessment_url` jest ustawione
2. Jeśli jest - może być problem z parsowaniem PDF
3. Użyj przycisku "Zobacz pełny dokument OSR"

---

## 📖 Więcej Informacji

- **Pełna dokumentacja:** `NOWE_FUNKCJONALNOSCI.md`
- **Przewodnik admina:** `ADMIN_GUIDE_RCL.md`
- **Wymagania projektu:** `projekt.md`
- **API:** `API_DOCUMENTATION.md`

---

## ✅ Checklist Pierwszego Użycia

**Dla Użytkowników:**
- [ ] Zarejestruj się / Zaloguj
- [ ] Przejdź do `/consultations`
- [ ] Znajdź interesujący projekt
- [ ] Ustaw alert dla projektu
- [ ] Sprawdź OSR dla projektu
- [ ] Zobacz Legislative Train

**Dla Adminów:**
- [ ] Zaloguj jako admin
- [ ] Uruchom sync RCL
- [ ] Sprawdź wyniki sync
- [ ] Zweryfikuj dane w `/consultations`
- [ ] Przetestuj alerty
- [ ] Sprawdź logi błędów
- [ ] Ustaw cron job (opcjonalnie)

---

**Data:** Grudzień 2024  
**Wersja:** 2.0
