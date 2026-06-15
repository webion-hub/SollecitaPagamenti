import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Affidabilita } from "@/lib/scoring";
import {
  Canale,
  LABEL_CANALE,
  LABEL_LIVELLO,
  LABEL_STATO_FATTURA,
  LivelloSollecito,
  StatoFattura,
} from "@/lib/types";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";

const FASCIA_CLASS: Record<Affidabilita["fascia"], string> = {
  affidabile: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  buono: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  rischio: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  critico: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function AffidabilitaBadge({ a }: { a: Affidabilita }) {
  return (
    <Badge className={cn("font-semibold", FASCIA_CLASS[a.fascia])}>
      {a.punteggio.toLocaleString("it-IT")}/10 · {a.label}
    </Badge>
  );
}

const STATO_CLASS: Record<StatoFattura, string> = {
  pagata: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  in_attesa: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  scaduta: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  contestata: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

export function StatoFatturaBadge({ stato }: { stato: StatoFattura }) {
  return (
    <Badge className={cn(STATO_CLASS[stato])}>{LABEL_STATO_FATTURA[stato]}</Badge>
  );
}

const LIVELLO_CLASS: Record<LivelloSollecito, string> = {
  1: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  3: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function LivelloBadge({ livello }: { livello: LivelloSollecito }) {
  return (
    <Badge className={cn(LIVELLO_CLASS[livello])}>
      {livello}. {LABEL_LIVELLO[livello]}
    </Badge>
  );
}

const CANALE_ICON: Record<Canale, React.ReactNode> = {
  email: <Mail className="size-3" />,
  pec: <ShieldCheck className="size-3" />,
  whatsapp: <MessageCircle className="size-3" />,
};

export function CanaleBadge({ canale }: { canale: Canale }) {
  return (
    <Badge variant="outline" className="gap-1">
      {CANALE_ICON[canale]}
      {LABEL_CANALE[canale]}
    </Badge>
  );
}
