"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Fattura, TipoAllegato } from "@/lib/types";
import { dataIt } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Paperclip, Trash2, Upload } from "lucide-react";

const TIPI: { value: TipoAllegato; label: string }[] = [
  { value: "preventivo", label: "Preventivo" },
  { value: "contratto", label: "Contratto" },
  { value: "ordine", label: "Ordine" },
  { value: "altro", label: "Altro" },
];

const TIPO_CLASS: Record<TipoAllegato, string> = {
  preventivo: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  contratto: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  ordine: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  altro: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export function AllegatiManager({ fattura }: { fattura: Fattura }) {
  const { aggiungiAllegato, rimuoviAllegato } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState<TipoAllegato>("preventivo");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    aggiungiAllegato(fattura.id, {
      nome: file.name,
      tipo,
      dimensioneKb: Math.max(1, Math.round(file.size / 1024)),
      autore: "Utente (upload)",
    });
    toast.success("Allegato caricato", { description: file.name });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="size-4" /> Allegati
        </CardTitle>
        <CardDescription>
          Preventivi, contratti e ordini dei commerciali, con info su costi e
          tempistiche.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fattura.allegati.length === 0 && (
          <p className="text-sm text-muted-foreground">Nessun allegato.</p>
        )}
        <ul className="space-y-2">
          {fattura.allegati.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{a.nome}</span>
                    <Badge className={TIPO_CLASS[a.tipo]}>{a.tipo}</Badge>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.dimensioneKb} KB · {dataIt(a.dataCaricamento)} · {a.autore}
                  </div>
                  {a.note && (
                    <div className="truncate text-xs text-muted-foreground italic">
                      {a.note}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  rimuoviAllegato(fattura.id, a.id);
                  toast("Allegato rimosso");
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="text-sm text-muted-foreground">Tipo:</span>
          <div className="flex flex-wrap gap-1">
            {TIPI.map((t) => (
              <button
                key={t.value}
                onClick={() => setTipo(t.value)}
                className={
                  "rounded-md border px-2.5 py-1 text-xs transition-colors " +
                  (tipo === t.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" /> Carica file
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onFile}
          />
        </div>
      </CardContent>
    </Card>
  );
}
