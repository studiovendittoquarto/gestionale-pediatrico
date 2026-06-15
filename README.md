# 🩺 Gestionale Pediatrico

Gestionale di appuntamenti per studio pediatrico, utilizzabile da **medico** e **segretaria**
contemporaneamente, con **aggiornamenti in tempo reale** (quello che fa uno, l'altro lo vede subito).

## ✨ Funzionalità
- **Accesso unico** con nome utente e password condivisi da tutti.
- **Tab Pediatra** fisso + **specialisti** aggiungibili/rimuovibili (Nutrizionista, Logopedista, …).
- **Minuteria personale** per ogni specialista (10/15/20/25/30 min), ricordata sul dispositivo.
- **Orari a bottoni** dalle 08:00 alle 19:00 in base alla durata scelta.
- **Doppia prenotazione controllata:** max 2 per orario. A 1 mostra `(1/2)`, a 2 il bottone si blocca.
- **Tipologie visita** (solo Pediatra): Visita, Bilancio, Controllo, Prima Visita, Vaccino, Urgenza.
  Per gli altri specialisti è bloccata su "Visita".
- **Bilanci in rosso** nella lista per risaltare a colpo d'occhio.
- **Tempo reale** via WebSocket (Socket.io): aggiunte, eliminazioni, stati e specialisti si sincronizzano su tutti i dispositivi.
- Extra utili: pulsante **Oggi**, **contatore appuntamenti**, **telefono cliccabile**,
  conferma prima di eliminare, indicatore **Live/Offline**, notifiche, design responsive.

## 🧱 Tecnologie
- **Frontend:** React + Vite, CSS puro (glassmorphism).
- **Backend:** Node.js + Express + Socket.io.
- **Database:** PostgreSQL (Neon, gratis e sempre attivo).

## 🚀 Pubblicare online
Vedi **[DEPLOY.md](DEPLOY.md)** — guida passo-passo (gratis) con GitHub + Neon + Render.

## 💻 Avvio in locale (facoltativo, per sviluppo)
```bash
# 1. Backend
copy .env.example .env   # poi compila DATABASE_URL, APP_USERNAME, APP_PASSWORD
npm install
npm start                # http://localhost:3000

# 2. Frontend (in un secondo terminale)
cd client
npm install
npm run dev              # http://localhost:5173
```

## 🗂️ Struttura
```
server/      backend Express + Socket.io
  index.js   API e WebSocket
  db.js      database PostgreSQL
client/      frontend React (Vite)
  src/       componenti, stili, helper
render.yaml  configurazione deploy automatico
DEPLOY.md    guida alla pubblicazione
```
