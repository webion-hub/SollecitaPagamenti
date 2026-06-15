# SollecitaPro — Solleciti pagamenti automatici (pilota)

Pilota costruito con **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui**.

Monitora le fatture emesse e gestisce solleciti graduali per ridurre gli insoluti e i giorni di scoperto.

## Funzionalità

- **Dashboard cash flow** — insoluto scaduto, incassato, in attesa, giorni medi di scoperto (DSO), aging per anzianità e coda dei solleciti dovuti.
- **Iter solleciti graduale** — max **3** avvisi con **7 giorni** di margine: `1. Primo avviso → 2. Secondo avviso → 3. Ultimo avviso`. Canali: **Email**, **PEC**, **WhatsApp** (consigliati per livello, selezionabili). Testi generati automaticamente, con anteprima.
- **Solleciti automatici** — il pulsante in sidebar scansiona tutte le fatture e invia il sollecito dovuto. Un **orologio simulato** (+7 / +30 gg) fa maturare le scadenze per dimostrare l'escalation.
- **Scoring affidabilità clienti** (0–100) — scende con ritardi e numero/intensità dei solleciti, risale con risposte e pagamenti puntuali. Fasce: Affidabile / Buono / A rischio / Critico.
- **Allegati** — preventivi, contratti, ordini caricati dai commerciali.
- **Stima commerciale** — importi e tempistiche stimati, **modificabili e confermabili** dall'utente.
- **Estensioni predisposte** — recupero crediti (CTA su iter completato), dashboard cash flow.

## Avvio

```bash
npm install          # già eseguito
npm run dev          # http://localhost:3000
npm run build        # build di produzione
```

## Architettura

- `src/lib/types.ts` — modello di dominio (Cliente, Fattura, Sollecito, Allegato, Stima).
- `src/lib/scoring.ts` — calcolo affidabilità + logica di escalation dei solleciti.
- `src/lib/templates.ts` — generazione testi (primo / secondo / ultimo avviso).
- `src/lib/store.tsx` — store globale (React Context) con persistenza su `localStorage`.
- `src/lib/seed.ts` — dati demo (data corrente simulata: 09/06/2026).
- `src/app/` — Dashboard `/`, Fatture `/fatture`, Clienti `/clienti` + relativi dettagli.

> I dati sono mock lato client; l'invio di email/PEC/WhatsApp è **simulato**. Sostituire le azioni in `store.tsx` con chiamate API reali per la messa in produzione.
