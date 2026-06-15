"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Fattura, Stima } from "@/lib/types";
import { eurPrecise } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, Pencil } from "lucide-react";

export function StimaEditor({ fattura }: { fattura: Fattura }) {
  const { aggiornaStima } = useStore();
  const [editing, setEditing] = useState(false);

  const stima = fattura.stima;
  const [importo, setImporto] = useState(stima?.importoStimato ?? 0);
  const [giorni, setGiorni] = useState(stima?.tempisticheGiorni ?? 30);
  const [note, setNote] = useState(stima?.note ?? "");

  const salva = (conferma: boolean) => {
    const nuova: Stima = {
      importoStimato: Number(importo) || 0,
      tempisticheGiorni: Number(giorni) || 0,
      note,
      autore: stima?.autore ?? "Utente",
      confermata: conferma,
    };
    aggiornaStima(fattura.id, nuova);
    setEditing(false);
    toast.success(conferma ? "Stima confermata" : "Stima aggiornata");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-4" /> Stima commerciale
        </CardTitle>
        <CardDescription>
          Importi e tempistiche stimati dal commerciale, modificabili e
          confermabili dall&apos;utente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stima && !editing && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Nessuna stima presente.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setEditing(true)}
            >
              Aggiungi stima
            </Button>
          </div>
        )}

        {stima && !editing && (
          <>
            <div className="flex items-center justify-between">
              {stima.confermata ? (
                <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="size-3" /> Confermata
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Da confermare
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" /> Modifica
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Importo stimato</dt>
                <dd className="text-lg font-semibold">
                  {eurPrecise(stima.importoStimato)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tempistiche</dt>
                <dd className="text-lg font-semibold">
                  {stima.tempisticheGiorni} gg
                </dd>
              </div>
            </dl>
            {stima.note && (
              <p className="rounded-md bg-muted p-3 text-sm">{stima.note}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Fonte: {stima.autore}
            </p>
            {!stima.confermata && (
              <Button size="sm" className="w-full" onClick={() => salva(true)}>
                Conferma stima
              </Button>
            )}
          </>
        )}

        {editing && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="imp">Importo stimato (€)</Label>
                <Input
                  id="imp"
                  type="number"
                  value={importo}
                  onChange={(e) => setImporto(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gg">Tempistiche (giorni)</Label>
                <Input
                  id="gg"
                  type="number"
                  value={giorni}
                  onChange={(e) => setGiorni(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => salva(stima?.confermata ?? false)}>
                Salva
              </Button>
              <Button size="sm" onClick={() => salva(true)} variant="secondary">
                Salva e conferma
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                Annulla
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
