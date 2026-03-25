# Technical Decisions

## MongoDB istället för SQL
Valdes eftersom datan är dokumentbaserad och ofta hämtas som hela objekt.
Nackdelen är mindre inbyggd datakonsistens.

## Affärslogik i backend
Ger en centraliserad lösning och säkerställer att alla klienter får samma resultat.

## JWT-design
Token innehåller endast userId för att minimera känslig data.
Aktuell data hämtas istället från databasen.

## Avgränsningar
Projektet saknar t.ex. rate limiting och refresh tokens, vilket hade varit nästa steg.