import { Cliente, Fattura, LivelloSollecito } from "./types";
import { eurPrecise, dataIt } from "./format";

interface TestoSollecito {
  oggetto: string;
  testo: string;
}

const MITTENTE = "Ufficio Amministrazione · Webion S.r.l.";

/**
 * Genera oggetto e corpo del sollecito in base al livello.
 * 1 = primo avviso, 2 = secondo avviso, 3 = ultimo avviso.
 */
export function generaTestoSollecito(
  livello: LivelloSollecito,
  cliente: Cliente,
  f: Fattura,
): TestoSollecito {
  const importo = eurPrecise(f.importo);
  const scad = dataIt(f.dataScadenza);
  const rif = `${f.numero} del ${dataIt(f.dataEmissione)}`;

  if (livello === 1) {
    return {
      oggetto: `Promemoria fattura ${f.numero}`,
      testo: `Gentile ${cliente.referente},

ci permettiamo di segnalarLe che la fattura ${rif}, dell'importo di ${importo}, risulta scaduta in data ${scad} e ad oggi non ancora saldata.

Comprendiamo che possa trattarsi di una semplice svista. Le saremmo grati se potesse provvedere al pagamento nei prossimi giorni o segnalarci eventuali problematiche.

Restiamo a disposizione per qualsiasi chiarimento.

Cordiali saluti,
${MITTENTE}`,
    };
  }

  if (livello === 2) {
    return {
      oggetto: `Sollecito di pagamento — fattura ${f.numero}`,
      testo: `Spett.le ${cliente.ragioneSociale},

nonostante il nostro precedente promemoria, la fattura ${rif} dell'importo di ${importo}, scaduta il ${scad}, risulta tuttora insoluta.

La invitiamo a regolarizzare la posizione entro 7 giorni dal ricevimento della presente. In caso di pagamento già effettuato, La preghiamo di trasmetterci la relativa contabile.

In attesa di un Suo riscontro, porgiamo distinti saluti.

${MITTENTE}`,
    };
  }

  return {
    oggetto: `ULTIMO AVVISO prima di azioni di recupero — fattura ${f.numero}`,
    testo: `Spett.le ${cliente.ragioneSociale},

con la presente Vi comunichiamo che, nonostante i precedenti solleciti, la fattura ${rif} dell'importo di ${importo}, scaduta il ${scad}, risulta ancora non saldata.

Vi diffidiamo a provvedere al pagamento entro e non oltre 7 giorni dal ricevimento della presente. Decorso inutilmente tale termine, ci vedremo costretti — senza ulteriore avviso — ad affidare la pratica al nostro servizio di recupero crediti, con addebito di interessi di mora e spese ai sensi del D.Lgs. 231/2002.

Confidiamo in un Vostro sollecito riscontro per evitare ogni ulteriore aggravio.

${MITTENTE}`,
  };
}
