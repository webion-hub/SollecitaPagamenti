"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Allegato,
  Canale,
  Cliente,
  DatasetState,
  Evento,
  Fattura,
  LABEL_LIVELLO,
  Stima,
  TipoEvento,
} from "./types";
import { seedState, OGGI } from "./seed";
import { generaTestoSollecito } from "./templates";
import { prossimoSollecito } from "./scoring";
import { addGiorni, dataIt } from "./format";

const STORAGE_KEY = "solleciti-pilota-v2";

const uid = (p: string) =>
  `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// helper: crea un evento per lo storico
const evento = (
  s: DatasetState,
  tipo: TipoEvento,
  titolo: string,
  extra: Partial<Evento> = {},
): Evento => ({
  id: uid("ev"),
  data: s.oggi,
  tipo,
  titolo,
  ...extra,
});

const nomeCliente = (s: DatasetState, clienteId: string) =>
  s.clienti.find((c) => c.id === clienteId)?.ragioneSociale ?? "";

// pure: costruisce il prossimo sollecito + relativo evento (o null)
const buildSollecito = (
  s: DatasetState,
  f: Fattura,
  canaliOverride?: Canale[],
): { fattura: Fattura; ev: Evento } | null => {
  const prossimo = prossimoSollecito(f, s.oggi);
  if (!prossimo) return null;
  const cliente = s.clienti.find((c) => c.id === f.clienteId)!;
  const canali = canaliOverride ?? prossimo.canaliConsigliati;
  const { oggetto, testo } = generaTestoSollecito(prossimo.livello, cliente, f);
  const fattura: Fattura = {
    ...f,
    solleciti: [
      ...f.solleciti,
      {
        id: uid("s"),
        livello: prossimo.livello,
        canali,
        dataInvio: s.oggi,
        stato: "inviato",
        oggetto,
        testo,
      },
    ],
  };
  const ev = evento(
    s,
    "sollecito",
    `Sollecito ${prossimo.livello} (${LABEL_LIVELLO[prossimo.livello]}) — ${f.numero}`,
    {
      dettaglio: `${cliente.ragioneSociale} · via ${canali.join(", ")}`,
      fatturaId: f.id,
      clienteId: f.clienteId,
    },
  );
  return { fattura, ev };
};

interface StoreCtx extends DatasetState {
  // selezione comoda
  getCliente: (id: string) => Cliente | undefined;
  getFattura: (id: string) => Fattura | undefined;
  fattureCliente: (clienteId: string) => Fattura[];
  // azioni
  inviaSollecito: (fatturaId: string, canali?: Canale[]) => void;
  segnaRisposta: (fatturaId: string, sollecitoId: string) => void;
  segnaPagata: (fatturaId: string) => void;
  segnaContestata: (fatturaId: string) => void;
  eseguiSollecitiAutomatici: () => number; // ritorna n. solleciti inviati
  avanzaTempo: (giorni: number) => void;
  tornaAOggi: () => void; // riporta la data simulata a OGGI
  aggiornaStima: (fatturaId: string, stima: Stima) => void;
  aggiungiAllegato: (
    fatturaId: string,
    allegato: Omit<Allegato, "id" | "dataCaricamento">,
  ) => void;
  rimuoviAllegato: (fatturaId: string, allegatoId: string) => void;
  reset: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DatasetState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  // carica da localStorage al mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persisti
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const inviaSollecito = useCallback((fatturaId: string, canali?: Canale[]) => {
    setState((s) => {
      const f = s.fatture.find((x) => x.id === fatturaId);
      if (!f) return s;
      const res = buildSollecito(s, f, canali);
      if (!res) return s;
      return {
        ...s,
        fatture: s.fatture.map((x) => (x.id === fatturaId ? res.fattura : x)),
        storico: [res.ev, ...s.storico],
      };
    });
  }, []);

  const eseguiSollecitiAutomatici = useCallback(() => {
    let count = 0;
    setState((s) => {
      const eventi: Evento[] = [];
      const fatture = s.fatture.map((f) => {
        const p = prossimoSollecito(f, s.oggi);
        if (p && p.dovuto) {
          const res = buildSollecito(s, f);
          if (res) {
            count++;
            eventi.push(res.ev);
            return res.fattura;
          }
        }
        return f;
      });
      return { ...s, fatture, storico: [...eventi, ...s.storico] };
    });
    return count;
  }, []);

  const segnaRisposta = useCallback(
    (fatturaId: string, sollecitoId: string) => {
      setState((s) => {
        const f = s.fatture.find((x) => x.id === fatturaId);
        if (!f) return s;
        return {
          ...s,
          fatture: s.fatture.map((x) =>
            x.id === fatturaId
              ? {
                  ...x,
                  solleciti: x.solleciti.map((sol) =>
                    sol.id === sollecitoId
                      ? { ...sol, stato: "risposta_ricevuta" as const }
                      : sol,
                  ),
                }
              : x,
          ),
          storico: [
            evento(s, "risposta", `Risposta ricevuta — ${f.numero}`, {
              dettaglio: nomeCliente(s, f.clienteId),
              fatturaId: f.id,
              clienteId: f.clienteId,
            }),
            ...s.storico,
          ],
        };
      });
    },
    [],
  );

  const segnaPagata = useCallback((fatturaId: string) => {
    setState((s) => {
      const f = s.fatture.find((x) => x.id === fatturaId);
      if (!f) return s;
      return {
        ...s,
        fatture: s.fatture.map((x) =>
          x.id === fatturaId
            ? { ...x, stato: "pagata" as const, dataPagamento: s.oggi }
            : x,
        ),
        storico: [
          evento(s, "pagamento", `Fattura ${f.numero} saldata`, {
            dettaglio: nomeCliente(s, f.clienteId),
            fatturaId: f.id,
            clienteId: f.clienteId,
          }),
          ...s.storico,
        ],
      };
    });
  }, []);

  const segnaContestata = useCallback((fatturaId: string) => {
    setState((s) => {
      const f = s.fatture.find((x) => x.id === fatturaId);
      if (!f) return s;
      return {
        ...s,
        fatture: s.fatture.map((x) =>
          x.id === fatturaId ? { ...x, stato: "contestata" as const } : x,
        ),
        storico: [
          evento(s, "contestazione", `Fattura ${f.numero} contestata`, {
            dettaglio: nomeCliente(s, f.clienteId),
            fatturaId: f.id,
            clienteId: f.clienteId,
          }),
          ...s.storico,
        ],
      };
    });
  }, []);

  const avanzaTempo = useCallback((giorni: number) => {
    setState((s) => {
      const oggi = addGiorni(s.oggi, giorni);
      const fatture = s.fatture.map((f) => {
        if (
          f.stato === "in_attesa" &&
          new Date(oggi) > new Date(f.dataScadenza)
        ) {
          return { ...f, stato: "scaduta" as const };
        }
        return f;
      });
      return {
        ...s,
        oggi,
        fatture,
        storico: [
          {
            id: uid("ev"),
            data: oggi,
            tipo: "tempo" as const,
            titolo: `Tempo avanzato di ${giorni} giorni`,
            dettaglio: `Data simulata: ${dataIt(oggi)}`,
          },
          ...s.storico,
        ],
      };
    });
  }, []);

  const tornaAOggi = useCallback(() => {
    setState((s) => {
      if (s.oggi === OGGI) return s;
      return {
        ...s,
        oggi: OGGI,
        storico: [
          {
            id: uid("ev"),
            data: OGGI,
            tipo: "tempo" as const,
            titolo: "Simulazione riportata alla data odierna",
            dettaglio: `Data: ${dataIt(OGGI)}`,
          },
          ...s.storico,
        ],
      };
    });
  }, []);

  const aggiornaStima = useCallback((fatturaId: string, stima: Stima) => {
    setState((s) => {
      const f = s.fatture.find((x) => x.id === fatturaId);
      if (!f) return s;
      return {
        ...s,
        fatture: s.fatture.map((x) =>
          x.id === fatturaId ? { ...x, stima } : x,
        ),
        storico: [
          evento(
            s,
            "stima",
            `Stima ${stima.confermata ? "confermata" : "aggiornata"} — ${f.numero}`,
            {
              dettaglio: nomeCliente(s, f.clienteId),
              fatturaId: f.id,
              clienteId: f.clienteId,
            },
          ),
          ...s.storico,
        ],
      };
    });
  }, []);

  const aggiungiAllegato = useCallback(
    (fatturaId: string, a: Omit<Allegato, "id" | "dataCaricamento">) => {
      setState((s) => {
        const f = s.fatture.find((x) => x.id === fatturaId);
        if (!f) return s;
        return {
          ...s,
          fatture: s.fatture.map((x) =>
            x.id === fatturaId
              ? {
                  ...x,
                  allegati: [
                    ...x.allegati,
                    { ...a, id: uid("a"), dataCaricamento: s.oggi },
                  ],
                }
              : x,
          ),
          storico: [
            evento(s, "allegato", `Allegato caricato — ${f.numero}`, {
              dettaglio: `${a.nome} (${a.tipo})`,
              fatturaId: f.id,
              clienteId: f.clienteId,
            }),
            ...s.storico,
          ],
        };
      });
    },
    [],
  );

  const rimuoviAllegato = useCallback(
    (fatturaId: string, allegatoId: string) => {
      setState((s) => ({
        ...s,
        fatture: s.fatture.map((x) =>
          x.id === fatturaId
            ? { ...x, allegati: x.allegati.filter((a) => a.id !== allegatoId) }
            : x,
        ),
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    setState(seedState);
  }, []);

  const value = useMemo<StoreCtx>(
    () => ({
      ...state,
      getCliente: (id) => state.clienti.find((c) => c.id === id),
      getFattura: (id) => state.fatture.find((f) => f.id === id),
      fattureCliente: (clienteId) =>
        state.fatture.filter((f) => f.clienteId === clienteId),
      inviaSollecito,
      segnaRisposta,
      segnaPagata,
      segnaContestata,
      eseguiSollecitiAutomatici,
      avanzaTempo,
      tornaAOggi,
      aggiornaStima,
      aggiungiAllegato,
      rimuoviAllegato,
      reset,
    }),
    [
      state,
      inviaSollecito,
      segnaRisposta,
      segnaPagata,
      segnaContestata,
      eseguiSollecitiAutomatici,
      avanzaTempo,
      tornaAOggi,
      aggiornaStima,
      aggiungiAllegato,
      rimuoviAllegato,
      reset,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore deve essere usato dentro StoreProvider");
  return ctx;
}
