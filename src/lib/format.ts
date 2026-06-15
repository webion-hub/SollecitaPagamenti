export const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const eurPrecise = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(n);

// Formato dd-mm-yyyy a partire da una data ISO (YYYY-MM-DD)
export const dataIt = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

export const dataItBreve = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}-${m}`;
};

/** ISO date (YYYY-MM-DD) a partire da un Date */
export const toIso = (d: Date) => d.toISOString().slice(0, 10);

/** Differenza in giorni tra due date ISO (a - b) */
export const giorniTra = (a: string, b: string) =>
  Math.round(
    (new Date(a + "T00:00:00").getTime() - new Date(b + "T00:00:00").getTime()) /
      86_400_000,
  );

/** Aggiunge giorni a una data ISO */
export const addGiorni = (iso: string, giorni: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + giorni);
  return toIso(d);
};

export const iniziali = (nome: string) =>
  nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
