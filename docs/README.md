# BudgetBuddy – Examensarbete (Fullstack)

BudgetBuddy är en fullstack-webbapplikation framtagen som examensarbete.  
Applikationen är byggd för att hjälpa två personer (t.ex. sambor) att planera sin gemensamma månadsbudget och automatiskt räkna ut hur kostnader ska fördelas på ett rättvist sätt.

Fokus i projektet ligger på **backendlogik, datamodellering och affärsregler**, snarare än ett färdigpolerat gränssnitt.

---

## Syfte

Syftet med BudgetBuddy är att lösa ett verkligt vardagsproblem:  
hur man på ett enkelt och rättvist sätt kan dela upp gemensamma utgifter när man inte tjänar lika mycket.

Applikationen låter användare:
- skapa ett gemensamt hushåll
- ange inkomster
- sätta en månadsbudget uppdelad i kategorier
- välja hur kostnaderna ska fördelas mellan personerna

Systemet räknar sedan automatiskt ut **hur mycket varje person ska bidra**, både totalt och per kategori.

---

## Grundidé

Istället för att manuellt räkna i Excel varje månad:
- “Vem ska betala vad?”
- “Hur blir det rättvist om vi tjänar olika?”
- “Vad händer om vi vill dela 50/50 istället?”

…hanterar BudgetBuddy detta via tydliga regler och beräkningar i backend.

---

## Teknikstack

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT-baserad autentisering
- MVC-struktur (models, controllers, routes, middleware)

### Frontend 
- React
- Tailwind CSS

---

## Autentisering & säkerhet

- Registrering och inloggning med JWT
- Skyddade API-endpoints via middleware
- Alla resurser är kopplade till användarens hushåll

---

## Hushåll & användare

- En användare kan skapa eller gå med i ett hushåll
- Ett hushåll kan ha flera medlemmar
- Varje medlem har en registrerad månadsinkomst
- Budget och beräkningar sker alltid på hushållsnivå

---

## Budgetplan (per månad)

För varje månad kan hushållet:
- skapa eller uppdatera en budgetplan
- ange valfria kategorier (t.ex. hyra, mat, nöje, sparande)
- sätta belopp per kategori

Exempel:
- Hyra: 14 500 kr
- Mat: 4 500 kr
- Spar: 5 000 kr
- Nöje: 1 000 kr

---

## Rättvis fördelning (kärnfunktion)

Applikationen stödjer flera sätt att dela upp kostnaderna:

### 1. Inkomstbaserad (default)
Varje person betalar en andel baserat på sin inkomst i förhållande till hushållets totala inkomst.

Exempel:
- Person A tjänar 30 000 kr
- Person B tjänar 20 000 kr  
→ Person A betalar mer av budgeten.

### 2. 50/50
Budgeten delas lika oavsett inkomst.

### 3. Tjänar mest betalar X % mer
Den person som tjänar mest betalar t.ex. 20 % mer än den andra (relativt), oberoende av exakta inkomstsiffror.

Alla beräkningar görs i backend och returneras färdiga för frontend att visa.

---

## Must-have (klart)

- Autentisering (JWT)
- Skapa och gå med i hushåll
- Registrera månadsinkomst per användare
- Skapa budgetplan per månad
- Budgetkategorier med belopp
- Automatisk rättvis fördelning
  - Inkomstbaserad
  - 50/50
  - Tjänar mest betalar X % mer
- Tydlig API-respons för frontend
- Stabil avrundningslogik (summor stämmer alltid)

---

## Nice-to-have (framtida förbättringar)

- Historik över inkomster per månad
- Export av budget till CSV/Excel
- Mer detaljerad transaktionshantering
- Roller (t.ex. admin i hushåll)
- Fler än två användare med avancerad split-logik
- Diagram och visualisering i frontend