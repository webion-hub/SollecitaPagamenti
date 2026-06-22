"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ProssimoSollecito } from "@/lib/scoring";
import { generaTestoSollecito } from "@/lib/templates";
import { eur, dataIt } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Canale,
  Cliente,
  Fattura,
  LABEL_CANALE,
  LivelloSollecito,
} from "@/lib/types";
import { LivelloBadge } from "@/components/badges";
import { CanaliPicker } from "@/components/canali-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, Sparkles, Zap } from "lucide-react";

export interface Dovuto {
  f: Fattura;
  p: ProssimoSollecito;
}

interface ReviewItem {
  fatturaId: string;
  numero: string;
  descrizione: string;
  scadenza: string;
  cliente: Cliente;
  importo: number;
  livello: LivelloSollecito;
  canaliConsigliati: Canale[];
  canali: Canale[];
  oggetto: string;
  testo: string;
  includi: boolean;
  dettagli: boolean;
}

/**
 * CTA "Esegui solleciti automatici": apre un pannello laterale a destra con uno
 * stepper. Per ogni sollecito mostra una review espandibile e il testo
 * precompilato dall'IA, modificabile, con canali per destinatario; le singole
 * fatture si possono escludere prima dell'invio.
 */
export function SollecitiAutoDialog({
  dovuti,
  disabled,
}: {
  dovuti: Dovuto[];
  disabled?: boolean;
}) {
  const { getCliente, inviaSollecito } = useStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [step, setStep] = useState(0);

  const buildItems = () => {
    setStep(0);
    setItems(
      dovuti.map(({ f, p }) => {
        const cliente = getCliente(f.clienteId)!;
        const t = generaTestoSollecito(p.livello, cliente, f);
        return {
          fatturaId: f.id,
          numero: f.numero,
          descrizione: f.descrizione,
          scadenza: f.dataScadenza,
          cliente,
          importo: f.importo,
          livello: p.livello,
          canaliConsigliati: p.canaliConsigliati,
          canali: [...p.canaliConsigliati],
          oggetto: t.oggetto,
          testo: t.testo,
          includi: true,
          dettagli: false,
        };
      }),
    );
  };

  const update = (i: number, patch: Partial<ReviewItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const toggleCanale = (i: number, c: Canale) =>
    update(i, {
      canali: items[i].canali.includes(c)
        ? items[i].canali.filter((x) => x !== c)
        : [...items[i].canali, c],
    });

  const selezionati = items.filter((it) => it.includi && it.canali.length > 0);
  const ultimo = step >= items.length - 1;
  const current = items[step];

  const conferma = () => {
    selezionati.forEach((it) =>
      inviaSollecito(it.fatturaId, it.canali, {
        oggetto: it.oggetto,
        testo: it.testo,
      }),
    );
    setOpen(false);
    toast.success(
      `${selezionati.length} ${selezionati.length === 1 ? "sollecito inviato" : "solleciti inviati"}`,
      { description: "Inviati sui canali selezionati per ciascun cliente." },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) buildItems();
        setOpen(o);
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="lg"
            disabled={disabled}
            className="h-11 gap-2 rounded-full px-6 text-[0.95rem] shadow-md shadow-primary/20"
          >
            <Zap className="size-4" />
            Esegui solleciti automatici
            {dovuti.length > 0 && (
              <span className="ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-sm font-semibold">
                {dovuti.length}
              </span>
            )}
          </Button>
        }
      />
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rivedi prima di inviare</DialogTitle>
          <DialogDescription>
            Controlla testo e canali di ogni sollecito. Puoi modificare il
            messaggio o escludere singole fatture.
          </DialogDescription>
        </DialogHeader>

        {current && (
          <>
            {/* Stepper: una tappa per sollecito, cliccabile */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                {items.map((it, i) => (
                  <button
                    key={it.fatturaId}
                    type="button"
                    onClick={() => setStep(i)}
                    aria-label={`Vai al sollecito ${i + 1}`}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      i === step
                        ? "bg-primary"
                        : it.includi
                          ? "bg-primary/30"
                          : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Sollecito {step + 1} di {items.length}
                {!current.includi && " · escluso dall'invio"}
              </div>
            </div>

            {/* Contenuto della tappa corrente */}
            <div className="-mr-1 flex-1 space-y-4 overflow-y-auto pr-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {current.cliente.ragioneSociale}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {current.numero} ·{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {eur(current.importo)}
                    </span>
                  </div>
                </div>
                <LivelloBadge livello={current.livello} />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={current.includi}
                  onChange={(e) => update(step, { includi: e.target.checked })}
                  className="size-4 accent-primary"
                />
                Includi questo sollecito nell&apos;invio
              </label>

              {/* Review espandibile dei dettagli fattura */}
              <div>
                <button
                  type="button"
                  onClick={() => update(step, { dettagli: !current.dettagli })}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {current.dettagli ? "Nascondi dettagli" : "Mostra dettagli fattura"}
                </button>
                {current.dettagli && (
                  <dl className="mt-2 space-y-1 rounded-md border bg-muted/30 p-3 text-sm">
                    <Riga label="Descrizione" value={current.descrizione} />
                    <Riga label="Scadenza" value={dataIt(current.scadenza)} />
                    <Riga
                      label="Canali consigliati"
                      value={current.canaliConsigliati
                        .map((c) => LABEL_CANALE[c])
                        .join(", ")}
                    />
                  </dl>
                )}
              </div>

              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Canali di invio · seleziona uno o più
                </div>
                <CanaliPicker
                  canali={current.canali}
                  consigliati={current.canaliConsigliati}
                  onToggle={(c) => toggleCanale(step, c)}
                  disabled={!current.includi}
                />
                {current.includi && current.canali.length === 0 && (
                  <p className="mt-1.5 text-xs text-destructive">
                    Seleziona almeno un canale o escludi la fattura.
                  </p>
                )}
              </div>

              {/* Testo precompilato dall'IA, modificabile */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">
                  Messaggio
                </div>
                <Input
                  value={current.oggetto}
                  onChange={(e) => update(step, { oggetto: e.target.value })}
                  disabled={!current.includi}
                  placeholder="Oggetto"
                />
                <Textarea
                  value={current.testo}
                  onChange={(e) => update(step, { testo: e.target.value })}
                  rows={9}
                  disabled={!current.includi}
                  className="text-sm"
                />
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  Testo generato dall&apos;IA · puoi modificarlo prima
                  dell&apos;invio.
                </p>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            className="gap-1"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="size-4" /> Indietro
          </Button>
          <div className="flex gap-2">
            {!ultimo && (
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setStep((s) => Math.min(items.length - 1, s + 1))}
              >
                Avanti <ChevronRight className="size-4" />
              </Button>
            )}
            <Button
              onClick={conferma}
              disabled={selezionati.length === 0}
              className="gap-2"
            >
              <Send className="size-4" />
              Invia {selezionati.length}{" "}
              {selezionati.length === 1 ? "sollecito" : "solleciti"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Riga({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
