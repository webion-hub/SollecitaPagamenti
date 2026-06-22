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

/**
 * Genera la diffida formale di pagamento da usare a iter di sollecito concluso,
 * come passo preliminare all'affidamento al recupero crediti.
 */
export function generaDiffida(cliente: Cliente, f: Fattura): TestoSollecito {
  const importo = eurPrecise(f.importo);
  const rif = `${f.numero} del ${dataIt(f.dataEmissione)}`;
  return {
    oggetto: `DIFFIDA AD ADEMPIERE — fattura ${f.numero}`,
    testo: `Spett.le ${cliente.ragioneSociale},
alla c.a. di ${cliente.referente},

premesso che la fattura ${rif}, dell'importo di ${importo} scaduta il ${dataIt(f.dataScadenza)}, risulta tuttora insoluta nonostante i ${f.solleciti.length} solleciti già trasmessi,

con la presente, ai sensi e per gli effetti dell'art. 1454 c.c., Vi

DIFFIDIAMO E INTIMIAMO

a provvedere al pagamento integrale della somma dovuta entro il termine perentorio di 15 (quindici) giorni dal ricevimento della presente.

Decorso inutilmente tale termine, ci riterremo liberi di intraprendere ogni opportuna azione a tutela del nostro credito, ivi compresa la richiesta di decreto ingiuntivo, con addebito di interessi di mora ex D.Lgs. 231/2002, spese legali e ulteriori oneri a Vostro carico.

La presente vale altresì quale costituzione in mora ad ogni effetto di legge.

${MITTENTE}`,
  };
}
