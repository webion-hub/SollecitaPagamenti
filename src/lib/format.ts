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

// Palette deterministica per gli avatar: lo stesso seed (id cliente) produce
// sempre lo stesso colore, così l'identità visiva è stabile tra le pagine.
const PALETTE_AVATAR = [
  "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
];

export const coloreAvatar = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE_AVATAR[Math.abs(h) % PALETTE_AVATAR.length];
};

/**
 * Colore del testo per i giorni di ritardo: la gravità deve essere percepibile
 * senza leggere il numero. ≤0 in regola, 1–30 attenzione, 31–60 alto, >60 critico.
 */
export const coloreRitardo = (giorni: number) => {
  if (giorni <= 0) return "text-emerald-600 dark:text-emerald-400";
  if (giorni <= 30) return "text-yellow-600 dark:text-yellow-400";
  if (giorni <= 60) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};
