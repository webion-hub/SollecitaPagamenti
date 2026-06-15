import {
  Canale,
  Cliente,
  Fattura,
  GIORNI_MARGINE,
  LivelloSollecito,
  MAX_SOLLECITI,
} from "./types";
import { addGiorni, dataIt, giorniTra } from "./format";

// ---------------------------------------------------------------------------
// Affidabilità cliente
// Lo scoring varia in base a: ritardi di pagamento, fatture scaducte aperte,
// e numero/intensità dei solleciti inviati (più solleciti = meno affidabile).
// ---------------------------------------------------------------------------

export interface Affidabilita {
  punteggio: number; // 0..10 (una cifra decimale)
  fascia: "affidabile" | "buono" | "rischio" | "critico";
  label: string;
}

const PENALITA_LIVELLO: Record<LivelloSollecito, number> = {
  1: 4, // primo avviso
  2: 9, // secondo avviso
  3: 18, // ultimo avviso
};

export function calcolaAffidabilita(
  cliente: Cliente,
  fatture: Fattura[],
  oggi: string,
): Affidabilita {
  const mie = fatture.filter((f) => f.clienteId === cliente.id);
  let punteggio = 100;

  for (const f of mie) {
    // Penalità per solleciti inviati (intensità crescente)
    for (const s of f.solleciti) {
      punteggio -= PENALITA_LIVELLO[s.livello];
      // se ha risposto dopo il sollecito, recupera un po'
      if (s.stato === "risposta_ricevuta") punteggio += 2;
    }

    if (f.stato === "pagata" && f.dataPagamento) {
      const ritardo = giorniTra(f.dataPagamento, f.dataScadenza);
      if (ritardo <= 0)
        punteggio += 4; // pagata in tempo/anticipo → bonus
      else punteggio -= Math.min(ritardo * 0.3, 12);
    }

    if (f.stato === "scaduta") {
      const ritardo = Math.max(0, giorniTra(oggi, f.dataScadenza));
      punteggio -= Math.min(ritardo * 0.4, 25);
    }

    if (f.stato === "contestata") punteggio -= 6;
  }

  // normalizza su scala 0..10 con una cifra decimale
  const grezzo = Math.max(0, Math.min(100, punteggio));
  const su10 = Math.round(grezzo / 10 * 10) / 10;
  return { punteggio: su10, ...fascia(su10) };
}

function fascia(p: number): Pick<Affidabilita, "fascia" | "label"> {
  if (p >= 8) return { fascia: "affidabile", label: "Affidabile" };
  if (p >= 6) return { fascia: "buono", label: "Buono" };
  if (p >= 4) return { fascia: "rischio", label: "A rischio" };
  return { fascia: "critico", label: "Critico" };
}

// ---------------------------------------------------------------------------
// Logica di escalation dei solleciti
// Max 3 solleciti, 7 giorni di margine tra uno e il successivo.
// primo avviso (1) → secondo avviso (2) → ultimo avviso (3)
// ---------------------------------------------------------------------------

export interface ProssimoSollecito {
  livello: LivelloSollecito;
  dataPrevista: string; // ISO — quando va inviato
  dovuto: boolean; // true se oggi >= dataPrevista
  canaliConsigliati: Canale[];
}

/** Canali consigliati per livello: si alza il "volume" con l'urgenza */
export const CANALI_PER_LIVELLO: Record<LivelloSollecito, Canale[]> = {
  1: ["email"],
  2: ["email", "pec"],
  3: ["pec", "whatsapp"],
};

/**
 * Calcola il prossimo sollecito previsto per una fattura.
 * Ritorna null se: pagata, contestata, già inviati 3 solleciti, oppure
 * l'ultimo sollecito ha ricevuto risposta (in attesa di pagamento concordato).
 */
export function prossimoSollecito(
  f: Fattura,
  oggi: string,
): ProssimoSollecito | null {
  if (f.stato === "pagata" || f.stato === "contestata") return null;

  const inviati = f.solleciti.length;
  if (inviati >= MAX_SOLLECITI) return null;

  const ultimo = f.solleciti[inviati - 1];
  if (ultimo && ultimo.stato === "risposta_ricevuta") return null;

  const livello = (inviati + 1) as LivelloSollecito;

  // Primo sollecito: dovuto alla scadenza. Successivi: +7 giorni dall'ultimo.
  const dataPrevista = ultimo
    ? addGiorni(ultimo.dataInvio, GIORNI_MARGINE)
    : f.dataScadenza;

  return {
    livello,
    dataPrevista,
    dovuto: giorniTra(oggi, dataPrevista) >= 0,
    canaliConsigliati: CANALI_PER_LIVELLO[livello],
  };
}

/** Stato sintetico della pratica di sollecito per una fattura */
export function statoEscalation(f: Fattura, oggi: string): string {
  if (f.stato === "pagata") return "Pagata";
  if (f.stato === "contestata") return "Contestata";
  const inviati = f.solleciti.length;
  const ultimo = f.solleciti[inviati - 1];
  if (ultimo?.stato === "risposta_ricevuta")
    return "Risposta ricevuta · in attesa pagamento";
  if (inviati >= MAX_SOLLECITI) return "Iter completato · valutare recupero crediti";
  const prossimo = prossimoSollecito(f, oggi);
  if (!prossimo) return "Nessun sollecito previsto";
  if (prossimo.dovuto) return `Sollecito ${prossimo.livello} da inviare`;
  return `Prossimo sollecito il ${dataIt(prossimo.dataPrevista)}`;
}
