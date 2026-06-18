"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { dataIt } from "@/lib/format";
import { TipoEvento } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Ban,
  BadgeCheck,
  ClipboardList,
  Clock3,
  CornerUpLeft,
  Paperclip,
  Send,
} from "lucide-react";

const META: Record<
  TipoEvento,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  sollecito: {
    label: "Solleciti",
    icon: <Send className="size-4" />,
    cls: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  pagamento: {
    label: "Pagamenti",
    icon: <BadgeCheck className="size-4" />,
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  risposta: {
    label: "Risposte",
    icon: <CornerUpLeft className="size-4" />,
    cls: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  },
  contestazione: {
    label: "Contestazioni",
    icon: <Ban className="size-4" />,
    cls: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  stima: {
    label: "Stime",
    icon: <ClipboardList className="size-4" />,
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  allegato: {
    label: "Allegati",
    icon: <Paperclip className="size-4" />,
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  tempo: {
    label: "Tempo",
    icon: <Clock3 className="size-4" />,
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
};

const FILTRI: (TipoEvento | "tutti")[] = [
  "tutti",
  "sollecito",
  "pagamento",
  "risposta",
  "contestazione",
  "stima",
  "allegato",
];

export default function StoricoPage() {
  const { storico } = useStore();
  const [filtro, setFiltro] = useState<TipoEvento | "tutti">("tutti");

  const visibili = storico.filter(
    (e) => filtro === "tutti" || e.tipo === filtro,
  );

  // raggruppa per data
  const gruppi = visibili.reduce<Record<string, typeof visibili>>((acc, e) => {
    (acc[e.data] ??= []).push(e);
    return acc;
  }, {});
  const date = Object.keys(gruppi).sort((a, b) => b.localeCompare(a));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Storico attività</h1>
        <p className="text-sm text-muted-foreground">
          Registro cronologico di solleciti, pagamenti, risposte e modifiche.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTRI.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filtro === f ? "default" : "outline"}
            onClick={() => setFiltro(f)}
          >
            {f === "tutti" ? "Tutti" : META[f].label}
          </Button>
        ))}
      </div>

      {date.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nessun evento per questo filtro.
          </CardContent>
        </Card>
      )}

      {date.map((d) => (
        <Card key={d}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{dataIt(d)}</CardTitle>
            <CardDescription>{gruppi[d].length} eventi</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {gruppi[d].map((e) => {
                const m = META[e.tipo];
                const inner = (
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full " +
                        m.cls
                      }
                    >
                      {m.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{e.titolo}</div>
                      {e.dettaglio && (
                        <div className="text-xs text-muted-foreground">
                          {e.dettaglio}
                        </div>
                      )}
                    </div>
                  </div>
                );
                return (
                  <li key={e.id}>
                    {e.fatturaId ? (
                      <Link
                        href={`/fatture/${e.fatturaId}`}
                        className="block rounded-lg p-1 transition-colors hover:bg-muted/50"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="p-1">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
