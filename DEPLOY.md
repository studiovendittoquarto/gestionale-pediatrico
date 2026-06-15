# 🚀 Come pubblicare il Gestionale Pediatrico online (gratis, sempre attivo)

Questa guida ti porta dal codice sul tuo PC a un **link funzionante su internet**,
usando solo servizi **gratuiti**. Tempo richiesto: ~15 minuti.

Userai questi 3 siti, accedendo con l'account Google **docvenditto@gmail.com**:

| Cosa | Servizio | A cosa serve |
|------|----------|--------------|
| 1. Codice | **GitHub** (github.com) | Contiene il programma |
| 2. Database | **Neon** (neon.tech) | Salva gli appuntamenti per sempre |
| 3. Sito online | **Render** (render.com) | Fa funzionare il sito e crea il link |

> Tutto il necessario è già configurato nel progetto. Devi solo cliccare e incollare.

---

## PASSO 1 — Mettere il codice su GitHub

1. Vai su **https://github.com** e fai **Sign in / Sign up** con **docvenditto@gmail.com** (pulsante "Continue with Google").
2. In alto a destra clicca **+** → **New repository**.
3. Nome repository: `gestionale-pediatrico`. Lascialo **Public**. Clicca **Create repository**.
4. Ora bisogna caricare i file. Due modi:

   **Modo A — dal sito (più semplice):** nella pagina del repository vuoto clicca
   *"uploading an existing file"*, trascina TUTTA la cartella del progetto
   (escludi `node_modules` se presenti) e clicca **Commit changes**.

   **Modo B — da terminale** (se hai Git installato), dentro la cartella del progetto:
   ```bash
   git init
   git add .
   git commit -m "Gestionale Pediatrico"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/gestionale-pediatrico.git
   git push -u origin main
   ```

---

## PASSO 2 — Creare il database gratuito (Neon)

1. Vai su **https://neon.tech** → **Sign up** con Google (**docvenditto@gmail.com**).
2. Clicca **Create project**. Nome a piacere (es. `gestionale`). Regione: **Europe (Frankfurt)**.
3. Appena creato vedrai una **Connection string** che inizia con `postgresql://...`.
   Clicca **Copy snippet / Copy**. **Tienila da parte**, ti serve tra poco.
   (Esempio: `postgresql://utente:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`)

> Neon è gratuito e **sempre attivo**: i dati non si perdono mai.

---

## PASSO 3 — Pubblicare il sito (Render)

1. Vai su **https://render.com** → **Get Started** / **Sign in** con Google (**docvenditto@gmail.com**).
2. Clicca **New +** → **Web Service**.
3. Collega GitHub e seleziona il repository **gestionale-pediatrico**.
4. Render leggerà da solo il file `render.yaml`. Se chiede i campi a mano, usa:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type / Plan:** **Free**
5. Scendi su **Environment Variables** e aggiungi queste 4 voci:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *(incolla la stringa di Neon del Passo 2)* |
   | `APP_USERNAME` | il nome utente che vuoi (es. `studio`) |
   | `APP_PASSWORD` | la password unica per tutti (es. `pediatria2026`) |
   | `JWT_SECRET` | una stringa lunga a caso (es. `qwertyuiop1234567890asdfgh`) |

6. Clicca **Create Web Service**. Render impiega 2-3 minuti per costruire tutto.
7. Al termine, in alto avrai il tuo **link** del tipo:
   **`https://gestionale-pediatrico.onrender.com`** 🎉

Apri quel link: comparirà la schermata di accesso. Entra con **APP_USERNAME / APP_PASSWORD**.
Lo stesso link e le stesse credenziali funzionano per **chiunque**, da qualsiasi dispositivo.

---

## ⚡ Tenere il sito "sempre sveglio" (consigliato)

Nel piano gratuito Render "addormenta" il sito dopo 15 minuti di inattività
(il primo accesso successivo richiede ~40 secondi). Per evitarlo:

1. Vai su **https://cron-job.org** (gratis, accedi con Google).
2. **Create cronjob** → URL: `https://IL-TUO-LINK.onrender.com/api/health`
3. Intervallo: **ogni 10 minuti**. Salva.

Così il sito resta sempre pronto e veloce.

---

## 🔄 Aggiornare il sito in futuro
Ogni volta che modifichi il codice e fai un nuovo upload/commit su GitHub,
Render ricostruisce e aggiorna il sito **da solo**. Non devi rifare nulla.

---

## ❓ Problemi comuni
- **"Application failed to respond" / errore database:** controlla che `DATABASE_URL`
  sia incollata correttamente (deve finire con `?sslmode=require`).
- **Login non funziona:** verifica `APP_USERNAME` e `APP_PASSWORD` nelle Environment Variables di Render.
- **Pagina bianca:** attendi che il primo build finisca (vedi i log su Render → "Logs").
