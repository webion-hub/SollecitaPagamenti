"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  CANALI_PER_LIVELLO,
  prossimoSollecito,
} from "@/lib/scoring";
import { generaTestoSollecito } from "@/lib/templates";
import { Canale, Cliente, Fattura, LABEL_CANALE, MAX_SOLLECITI } from "@/lib/types";
import { dataIt, giorniTra } from "@/lib/format";
import { LivelloBadge, CanaleBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2,
  Mail,
  MessageCircle,
  Scale,
  Send,
  ShieldCheck,
} from "lucide-react";

const CANALE_ICON: Record<Canale, React.ReactNode> = {
  email: <Mail className="size-4" />,
  pec: <ShieldCheck className="size-4" />,
  whatsapp: <MessageCircle className="size-4" />,
};

export function SollecitoPanel({
  fattura,
  cliente,
}: {
  fattura: Fattura;
  cliente: Cliente;
}) {
  const { oggi, inviaSollecito, segnaRisposta } = useStore();
  const prossimo = prossimoSollecito(fattura, oggi);

  const [canali, setCanali] = useState<Canale[]>(
    prossimo?.canaliConsigliati ?? ["email"],
  );

  // anteprima testo del prossimo sollecito
  const anteprima = useMemo(
    () =>
      prossimo
        ? generaTestoSollecito(prossimo.livello, cliente, fattura)
        : null,
    [prossimo, cliente, fattura],
  );

  const toggleCanale = (c: Canale) =>
    setCanali((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const invia = () => {
    if (canali.length === 0) {
      toast.error("Seleziona almeno un canale");
      return;
    }
    inviaSollecito(fattura.id, canali);
    toast.success(`Sollecito inviato via ${canali.map((c) => LABEL_CANALE[c]).join(", ")}`, {
      description: `${cliente.referente} — livello ${prossimo?.livello}.`,
    });
  };

  const iterCompletato = fattura.solleciti.length >= MAX_SOLLECITI;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iter solleciti</CardTitle>
        <CardDescription>
          {fattura.solleciti.length}/{MAX_SOLLECITI} solleciti inviati · 7 giorni di
          margine tra un avviso e il successivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Timeline */}
        {fattura.solleciti.length > 0 && (
          <ol className="space-y-3">
            {fattura.solleciti.map((s) => (
              <li key={s.id} className="flex gap-3">
                <div className="mt-1 flex flex-col items-center">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {s.livello}
                  </div>
                </div>
                <div className="flex-1 rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <LivelloBadge livello={s.livello} />
                      {s.canali.map((c) => (
                        <CanaleBadge key={c} canale={c} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dataIt(s.dataInvio)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium">{s.oggetto}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {s.stato === "risposta_ricevuta" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="size-3.5" /> Risposta ricevuta
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          segnaRisposta(fattura.id, s.id);
                          toast("Segnata risposta del cliente");
                        }}
                      >
                        Segna risposta ricevuta
                      </Button>
                    )}
                    <TestoDialog oggetto={s.oggetto} testo={s.testo} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        {fattura.solleciti.length > 0 && <Separator />}

        {/* Prossima azione */}
        {fattura.stato === "pagata" && (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="size-4" /> Fattura saldata: nessun sollecito
            necessario.
          </p>
        )}

        {fattura.stato === "contestata" && (
          <p className="text-sm text-muted-foreground">
            Fattura contestata: l&apos;iter di sollecito è sospeso fino a
            risoluzione.
          </p>
        )}

        {iterCompletato && fattura.stato !== "pagata" && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
            <div className="flex items-center gap-2 font-medium text-red-700 dark:text-red-300">
              <Scale className="size-4" /> Iter di sollecito completato
            </div>
            <p className="mt-1 text-sm text-red-600/90 dark:text-red-300/80">
              Inviati tutti e 3 i solleciti senza esito. È il momento di valutare
              l&apos;affidamento al recupero crediti.
            </p>
            <Button variant="destructive" size="sm" className="mt-3" disabled>
              Affida a recupero crediti (estensione)
            </Button>
          </div>
        )}

        {prossimo && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Prossimo sollecito:</span>
                <LivelloBadge livello={prossimo.livello} />
              </div>
              {prossimo.dovuto ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Dovuto ora
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Previsto il {dataIt(prossimo.dataPrevista)} (tra{" "}
                  {giorniTra(prossimo.dataPrevista, oggi)} gg)
                </span>
              )}
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                Canali di invio
              </div>
              <div className="flex flex-wrap gap-2">
                {(["email", "pec", "whatsapp"] as Canale[]).map((c) => {
                  const attivo = canali.includes(c);
                  const consigliato = prossimo.canaliConsigliati.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCanale(c)}
                      className={
                        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors " +
                        (attivo
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:bg-muted")
                      }
                    >
                      {CANALE_ICON[c]}
                      {LABEL_CANALE[c]}
                      {consigliato && !attivo && (
                        <span className="text-[10px] text-muted-foreground">
                          consigliato
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={invia} className="gap-2">
                <Send className="size-4" /> Invia sollecito {prossimo.livello}
              </Button>
              {anteprima && (
                <TestoDialog
                  oggetto={anteprima.oggetto}
                  testo={anteprima.testo}
                  trigger={<Button variant="outline">Anteprima testo</Button>}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TestoDialog({
  oggetto,
  testo,
  trigger,
}: {
  oggetto: string;
  testo: string;
  trigger?: React.ReactElement;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          trigger ?? (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              Vedi testo
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{oggetto}</DialogTitle>
          <DialogDescription>Anteprima del messaggio di sollecito</DialogDescription>
        </DialogHeader>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 font-sans text-sm">
          {testo}
        </pre>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Chiudi</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
