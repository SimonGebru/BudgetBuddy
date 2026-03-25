# Architecture

## Översikt
Applikationen är uppdelad i frontend och backend där backend ansvarar för affärslogik och beräkningar, medan frontend ansvarar för presentation.

## Backend
Backend är byggd med Express och följer en MVC-liknande struktur:

- Controllers: hanterar request/response
- Services: innehåller affärslogik och beräkningar
- Models: datamodeller via Mongoose

Affärslogiken ligger i services för att göra den återanvändbar och oberoende av HTTP.

## Frontend
Frontend är byggd i React och ansvarar för att visa data och hantera användarinput.

## Databasval
MongoDB valdes eftersom datan är dokumentbaserad, till exempel household med nested members och income history.