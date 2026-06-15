// Dominio applicativo — "Solleciti pagamenti automatici"

export type Canale = "email" | "pec" | "whatsapp";

export type LivelloSollecito = 1 | 2 | 3; // 1 = primo avviso, 2 = secondo avviso, 3 = ultimo avviso

export type StatoSollecito = "inviato" | "risposta_ricevuta";

export type StatoFattura = "pagata" | "in_attesa" | "scaduta" | "contestata";

export interface Sollecito {
  id: string;
  livello: LivelloSollecito;
  canali: Canale[];
  dataInvio: string; // ISO
  stato: StatoSollecito;
  oggetto: string;
  testo: string;
}

export type TipoAllegato = "preventivo" | "contratto" | "ordine" | "altro";

export interface Allegato {
  id: string;
  nome: string;
  tipo: TipoAllegato;
  dimensioneKb: number;
  dataCaricamento: string; // ISO
  autore: string; // commerciale che ha caricato
  note?: string;
}

export interface Stima {
  importoStimato: number;
  tempisticheGiorni: number;
  note: string;
  autore: string; // commerciale
  confermata: boolean; // confermata/modificata dall'utente
}

export interface Fattura {
  id: string;
  clienteId: string;
  numero: string;
  descrizione: string;
  importo: number;
  dataEmissione: string; // ISO
  dataScadenza: string; // ISO
  dataPagamento?: string; // ISO, se pagata
  stato: StatoFattura;
  solleciti: Sollecito[];
  allegati: Allegato[];
  stima?: Stima;
}

export interface Cliente {
  id: string;
  ragioneSociale: string;
  referente: string;
  email: string;
  pec: string;
  telefono: string; // usato per WhatsApp
  citta: string;
  // affidabilità è calcolata, non persistita
}

export type TipoEvento =
  | "sollecito"
  | "pagamento"
  | "risposta"
  | "contestazione"
  | "stima"
  | "allegato"
  | "tempo";

export interface Evento {
  id: string;
  data: string; // ISO — data simulata in cui è avvenuto
  tipo: TipoEvento;
  titolo: string;
  dettaglio?: string;
  fatturaId?: string;
  clienteId?: string;
}

export interface DatasetState {
  oggi: string; // data corrente simulata (ISO)
  clienti: Cliente[];
  fatture: Fattura[];
  storico: Evento[]; // dal più recente al più vecchio
}

export const LABEL_LIVELLO: Record<LivelloSollecito, string> = {
  1: "Primo avviso",
  2: "Secondo avviso",
  3: "Ultimo avviso",
};

export const LABEL_CANALE: Record<Canale, string> = {
  email: "Email",
  pec: "PEC",
  whatsapp: "WhatsApp",
};

export const LABEL_STATO_FATTURA: Record<StatoFattura, string> = {
  pagata: "Pagata",
  in_attesa: "In attesa",
  scaduta: "Scaduta",
  contestata: "Contestata",
};

export const GIORNI_MARGINE = 7; // settimana di margine tra un sollecito e il successivo
export const MAX_SOLLECITI = 3;
