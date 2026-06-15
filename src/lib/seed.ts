import { Cliente, DatasetState, Evento, Fattura, LABEL_LIVELLO } from "./types";

// Data corrente simulata del pilota
export const OGGI = "2026-06-09";

const clienti: Cliente[] = [
  {
    id: "c1",
    ragioneSociale: "Rossi Costruzioni S.r.l.",
    referente: "Marco Rossi",
    email: "amministrazione@rossicostruzioni.it",
    pec: "rossicostruzioni@pec.it",
    telefono: "+39 348 1122334",
    citta: "Bergamo",
  },
  {
    id: "c2",
    ragioneSociale: "Bianchi Software S.p.A.",
    referente: "Laura Bianchi",
    email: "finance@bianchisoftware.com",
    pec: "bianchisoftware@legalmail.it",
    telefono: "+39 333 7654321",
    citta: "Milano",
  },
  {
    id: "c3",
    ragioneSociale: "Verdi Logistica S.r.l.",
    referente: "Giuseppe Verdi",
    email: "contabilita@verdilogistica.it",
    pec: "verdilogistica@pec.it",
    telefono: "+39 340 5566778",
    citta: "Brescia",
  },
  {
    id: "c4",
    ragioneSociale: "Neri Studio Associato",
    referente: "Anna Neri",
    email: "segreteria@neristudio.it",
    pec: "neristudio@pec.it",
    telefono: "+39 347 9988776",
    citta: "Torino",
  },
  {
    id: "c5",
    ragioneSociale: "Gialli Retail S.r.l.",
    referente: "Paolo Gialli",
    email: "acquisti@gialliretail.it",
    pec: "gialliretail@pec.it",
    telefono: "+39 366 2233445",
    citta: "Verona",
  },
  {
    id: "c6",
    ragioneSociale: "Aurora Hotel & Resort",
    referente: "Chiara Aurora",
    email: "direzione@aurorahotel.it",
    pec: "aurorahotel@pec.it",
    telefono: "+39 351 4455667",
    citta: "Riva del Garda",
  },
];

const fatture: Fattura[] = [
  // Rossi — cattivo pagatore: scaduta con 2 solleciti, terzo da inviare
  {
    id: "f1",
    clienteId: "c1",
    numero: "2026/041",
    descrizione: "Sviluppo portale e-commerce — milestone 2",
    importo: 8400,
    dataEmissione: "2026-03-20",
    dataScadenza: "2026-04-19",
    stato: "scaduta",
    allegati: [
      {
        id: "a1",
        nome: "Preventivo_ecommerce_Rossi.pdf",
        tipo: "preventivo",
        dimensioneKb: 248,
        dataCaricamento: "2026-02-28",
        autore: "Luca Ferri (Sales)",
        note: "Preventivo firmato dal cliente, 2 milestone.",
      },
    ],
    stima: {
      importoStimato: 16000,
      tempisticheGiorni: 90,
      note: "Progetto in 2 milestone da 8.000 € + 8.000 €. Tempi stimati dal commerciale.",
      autore: "Luca Ferri (Sales)",
      confermata: true,
    },
    solleciti: [
      {
        id: "s1",
        livello: 1,
        canali: ["email"],
        dataInvio: "2026-04-19",
        stato: "inviato",
        oggetto: "Promemoria fattura 2026/041",
        testo:
          "Gentile Marco Rossi, ci permettiamo di segnalarLe che la fattura 2026/041 risulta scaduta...",
      },
      {
        id: "s2",
        livello: 2,
        canali: ["email", "pec"],
        dataInvio: "2026-04-26",
        stato: "inviato",
        oggetto: "Sollecito di pagamento — fattura 2026/041",
        testo:
          "Spett.le Rossi Costruzioni S.r.l., nonostante il nostro precedente promemoria...",
      },
    ],
  },
  // Rossi — altra scaduta, iter completato (3 solleciti) → recupero crediti
  {
    id: "f2",
    clienteId: "c1",
    numero: "2026/012",
    descrizione: "Canone manutenzione annuale",
    importo: 2200,
    dataEmissione: "2026-01-15",
    dataScadenza: "2026-02-14",
    stato: "scaduta",
    allegati: [],
    solleciti: [
      {
        id: "s3",
        livello: 1,
        canali: ["email"],
        dataInvio: "2026-02-14",
        stato: "inviato",
        oggetto: "Promemoria fattura 2026/012",
        testo: "Gentile Marco Rossi...",
      },
      {
        id: "s4",
        livello: 2,
        canali: ["email", "pec"],
        dataInvio: "2026-02-21",
        stato: "inviato",
        oggetto: "Sollecito di pagamento — fattura 2026/012",
        testo: "Spett.le Rossi Costruzioni S.r.l. ...",
      },
      {
        id: "s5",
        livello: 3,
        canali: ["pec", "whatsapp"],
        dataInvio: "2026-02-28",
        stato: "inviato",
        oggetto: "ULTIMO AVVISO — fattura 2026/012",
        testo: "Spett.le Rossi Costruzioni S.r.l., con la presente Vi diffidiamo...",
      },
    ],
  },
  // Bianchi — ottimo pagatore: tutto pagato in anticipo
  {
    id: "f3",
    clienteId: "c2",
    numero: "2026/050",
    descrizione: "Licenze SaaS Q2",
    importo: 5600,
    dataEmissione: "2026-04-01",
    dataScadenza: "2026-05-01",
    dataPagamento: "2026-04-28",
    stato: "pagata",
    allegati: [],
    solleciti: [],
  },
  {
    id: "f4",
    clienteId: "c2",
    numero: "2026/061",
    descrizione: "Consulenza architetturale",
    importo: 3200,
    dataEmissione: "2026-05-20",
    dataScadenza: "2026-06-19",
    stato: "in_attesa",
    allegati: [],
    solleciti: [],
  },
  // Verdi — medio: scaduta senza solleciti, primo sollecito DOVUTO oggi
  {
    id: "f5",
    clienteId: "c3",
    numero: "2026/055",
    descrizione: "Integrazione gestionale magazzino",
    importo: 4700,
    dataEmissione: "2026-04-10",
    dataScadenza: "2026-05-10",
    stato: "scaduta",
    allegati: [
      {
        id: "a2",
        nome: "Ordine_Verdi_magazzino.pdf",
        tipo: "ordine",
        dimensioneKb: 132,
        dataCaricamento: "2026-04-05",
        autore: "Sara Conti (Sales)",
      },
    ],
    solleciti: [],
  },
  // Verdi — sollecito 1 inviato, risposta ricevuta (pagamento concordato)
  {
    id: "f6",
    clienteId: "c3",
    numero: "2026/048",
    descrizione: "Setup infrastruttura cloud",
    importo: 6100,
    dataEmissione: "2026-03-15",
    dataScadenza: "2026-04-14",
    stato: "scaduta",
    allegati: [],
    solleciti: [
      {
        id: "s6",
        livello: 1,
        canali: ["email"],
        dataInvio: "2026-04-14",
        stato: "risposta_ricevuta",
        oggetto: "Promemoria fattura 2026/048",
        testo: "Gentile Giuseppe Verdi...",
      },
    ],
  },
  // Neri — critico: scaduta da molto, 1 sollecito, secondo DOVUTO
  {
    id: "f7",
    clienteId: "c4",
    numero: "2026/030",
    descrizione: "Restyling sito istituzionale",
    importo: 3900,
    dataEmissione: "2026-02-25",
    dataScadenza: "2026-03-27",
    stato: "scaduta",
    allegati: [],
    solleciti: [
      {
        id: "s7",
        livello: 1,
        canali: ["email"],
        dataInvio: "2026-05-20",
        stato: "inviato",
        oggetto: "Promemoria fattura 2026/030",
        testo: "Gentile Anna Neri...",
      },
    ],
  },
  // Gialli — nuovo cliente: fattura in attesa + preventivo da confermare
  {
    id: "f8",
    clienteId: "c5",
    numero: "2026/063",
    descrizione: "App mobile loyalty — acconto",
    importo: 5000,
    dataEmissione: "2026-06-01",
    dataScadenza: "2026-07-01",
    stato: "in_attesa",
    allegati: [
      {
        id: "a3",
        nome: "Preventivo_app_loyalty_v2.pdf",
        tipo: "preventivo",
        dimensioneKb: 412,
        dataCaricamento: "2026-05-25",
        autore: "Luca Ferri (Sales)",
        note: "Versione 2 dopo revisione scope con il cliente.",
      },
    ],
    stima: {
      importoStimato: 22000,
      tempisticheGiorni: 120,
      note: "Stima preliminare del commerciale: acconto 5.000 € + SAL. Da confermare con il cliente.",
      autore: "Luca Ferri (Sales)",
      confermata: false,
    },
    solleciti: [],
  },
  // Aurora — contestata
  {
    id: "f9",
    clienteId: "c6",
    numero: "2026/044",
    descrizione: "Campagna ADV stagione estiva",
    importo: 2800,
    dataEmissione: "2026-04-02",
    dataScadenza: "2026-05-02",
    stato: "contestata",
    allegati: [],
    solleciti: [],
  },
  // Aurora — pagata in ritardo
  {
    id: "f10",
    clienteId: "c6",
    numero: "2026/021",
    descrizione: "Gestione social Q1",
    importo: 1800,
    dataEmissione: "2026-01-30",
    dataScadenza: "2026-03-01",
    dataPagamento: "2026-03-25",
    stato: "pagata",
    allegati: [],
    solleciti: [
      {
        id: "s8",
        livello: 1,
        canali: ["email"],
        dataInvio: "2026-03-01",
        stato: "risposta_ricevuta",
        oggetto: "Promemoria fattura 2026/021",
        testo: "Gentile Chiara Aurora...",
      },
    ],
  },
];

// Storico iniziale derivato dai dati seed (solleciti già inviati, pagamenti, risposte)
function storicoIniziale(): Evento[] {
  const eventi: Evento[] = [];
  const nomeCliente = (id: string) =>
    clienti.find((c) => c.id === id)?.ragioneSociale ?? "";

  for (const f of fatture) {
    for (const s of f.solleciti) {
      eventi.push({
        id: `ev_s_${s.id}`,
        data: s.dataInvio,
        tipo: "sollecito",
        titolo: `Sollecito ${s.livello} (${LABEL_LIVELLO[s.livello]}) — ${f.numero}`,
        dettaglio: `${nomeCliente(f.clienteId)} · via ${s.canali.join(", ")}`,
        fatturaId: f.id,
        clienteId: f.clienteId,
      });
      if (s.stato === "risposta_ricevuta") {
        eventi.push({
          id: `ev_r_${s.id}`,
          data: s.dataInvio,
          tipo: "risposta",
          titolo: `Risposta ricevuta — ${f.numero}`,
          dettaglio: nomeCliente(f.clienteId),
          fatturaId: f.id,
          clienteId: f.clienteId,
        });
      }
    }
    if (f.stato === "pagata" && f.dataPagamento) {
      eventi.push({
        id: `ev_p_${f.id}`,
        data: f.dataPagamento,
        tipo: "pagamento",
        titolo: `Fattura ${f.numero} saldata`,
        dettaglio: nomeCliente(f.clienteId),
        fatturaId: f.id,
        clienteId: f.clienteId,
      });
    }
    if (f.stato === "contestata") {
      eventi.push({
        id: `ev_c_${f.id}`,
        data: f.dataScadenza,
        tipo: "contestazione",
        titolo: `Fattura ${f.numero} contestata`,
        dettaglio: nomeCliente(f.clienteId),
        fatturaId: f.id,
        clienteId: f.clienteId,
      });
    }
  }

  return eventi.sort((a, b) => b.data.localeCompare(a.data));
}

export const seedState: DatasetState = {
  oggi: OGGI,
  clienti,
  fatture,
  storico: storicoIniziale(),
};
