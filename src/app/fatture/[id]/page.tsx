"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { calcolaAffidabilita } from "@/lib/scoring";
import { eurPrecise, dataIt, giorniTra, coloreRitardo } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  StatoFatturaBadge,
  AffidabilitaBadge,
} from "@/components/badges";
import { SollecitoPanel } from "@/components/sollecito-panel";
import { StimaEditor } from "@/components/stima-editor";
import { AllegatiManager } from "@/components/allegati-manager";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ban,
  BadgeCheck,
  Building2,
  CalendarClock,
} from "lucide-react";

export default function FatturaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getFattura, getCliente, fatture, oggi, segnaPagata, segnaContestata } =
    useStore();
  const fattura = getFattura(id);

  if (!fattura)
    return (
      <div className="mx-auto max-w-3xl py-16 text-center text-muted-foreground">
        Fattura non trovata.{" "}
        <Link href="/fatture" className="underline">
          Torna alle fatture
        </Link>
      </div>
    );

  const cliente = getCliente(fattura.clienteId)!;
  const aff = calcolaAffidabilita(cliente, fatture, oggi);
  const ritardo = giorniTra(oggi, fattura.dataScadenza);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/fatture"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Fatture
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Fattura {fattura.numero}
            </h1>
            <StatoFatturaBadge stato={fattura.stato} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {fattura.descrizione}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold tracking-tight">
            {eurPrecise(fattura.importo)}
          </div>
          <div className="text-sm text-muted-foreground">
            Scad. {dataIt(fattura.dataScadenza)}
            {fattura.stato === "scaduta" && ritardo > 0 && (
              <span className={"font-medium " + coloreRitardo(ritardo)}>
                {" · "}+{ritardo} gg
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cliente + azioni */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
          <Link
            href={`/clienti/${cliente.id}`}
            className="flex items-center gap-3 hover:underline"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Building2 className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{cliente.ragioneSociale}</div>
              <div className="text-xs text-muted-foreground">
                {cliente.referente} · {cliente.email}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-muted-foreground">
              Affidabilità cliente
              <div className="mt-1">
                <AffidabilitaBadge a={aff} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Azioni rapide — gerarchia: l'invio del sollecito (nel pannello) resta
          l'azione primaria; queste sono azioni di stato, con peso decrescente. */}
      {fattura.stato !== "pagata" && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              segnaPagata(fattura.id);
              toast.success("Fattura segnata come pagata");
            }}
            className="gap-2"
          >
            <BadgeCheck className="size-4" /> Segna come pagata
          </Button>
          {fattura.stato !== "contestata" && (
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Ban className="size-4" /> Segna contestata
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Segnare la fattura come contestata?</DialogTitle>
                  <DialogDescription>
                    L&apos;iter di sollecito verrà sospeso fino alla risoluzione
                    della contestazione. Potrai riprenderlo in seguito.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Annulla</Button>} />
                  <DialogClose
                    render={
                      <Button
                        onClick={() => {
                          segnaContestata(fattura.id);
                          toast("Fattura segnata come contestata");
                        }}
                      >
                        Conferma contestazione
                      </Button>
                    }
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <SollecitoPanel fattura={fattura} cliente={cliente} />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="size-4" /> Dettagli documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Riga label="Numero" value={fattura.numero} />
              <Riga label="Emissione" value={dataIt(fattura.dataEmissione)} />
              <Riga label="Scadenza" value={dataIt(fattura.dataScadenza)} />
              {fattura.dataPagamento && (
                <Riga label="Pagata il" value={dataIt(fattura.dataPagamento)} />
              )}
            </CardContent>
          </Card>
          <StimaEditor fattura={fattura} />
          <AllegatiManager fattura={fattura} />
        </div>
      </div>
    </div>
  );
}

function Riga({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
