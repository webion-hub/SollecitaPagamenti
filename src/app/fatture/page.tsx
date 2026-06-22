"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { prossimoSollecito, statoEscalation } from "@/lib/scoring";
import { eur, dataIt, giorniTra, coloreRitardo } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatoFatturaBadge, LivelloBadge } from "@/components/badges";
import { StatoFattura } from "@/lib/types";

const FILTRI: { key: StatoFattura | "tutte" | "da_sollecitare"; label: string }[] = [
  { key: "tutte", label: "Tutte" },
  { key: "da_sollecitare", label: "Da sollecitare" },
  { key: "scaduta", label: "Scadute" },
  { key: "in_attesa", label: "In attesa" },
  { key: "pagata", label: "Pagate" },
  { key: "contestata", label: "Contestate" },
];

type FiltroKey = (typeof FILTRI)[number]["key"];

export default function FatturePage() {
  return (
    <Suspense>
      <FattureView />
    </Suspense>
  );
}

function FattureView() {
  const { fatture, oggi, getCliente } = useStore();
  const params = useSearchParams();
  const statoIniziale = FILTRI.some((f) => f.key === params.get("stato"))
    ? (params.get("stato") as FiltroKey)
    : "tutte";
  const [filtro, setFiltro] = useState<FiltroKey>(statoIniziale);

  const conta = (key: (typeof FILTRI)[number]["key"]) =>
    fatture.filter((f) => {
      if (key === "tutte") return true;
      if (key === "da_sollecitare") return prossimoSollecito(f, oggi)?.dovuto;
      return f.stato === key;
    }).length;

  const visibili = fatture
    .filter((f) => {
      if (filtro === "tutte") return true;
      if (filtro === "da_sollecitare") {
        const p = prossimoSollecito(f, oggi);
        return p?.dovuto;
      }
      return f.stato === filtro;
    })
    .sort((a, b) => a.dataScadenza.localeCompare(b.dataScadenza));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Fatture & solleciti
        </h1>
        <p className="text-sm text-muted-foreground">
          {fatture.length} fatture · {conta("da_sollecitare")} da sollecitare oggi
          · {conta("scaduta")} scadute
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {FILTRI.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filtro === f.key ? "default" : "outline"}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
            <span
              className={
                filtro === f.key
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }
            >
              {conta(f.key)}
            </span>
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{visibili.length} fatture</CardTitle>
          <CardDescription>Clicca una riga per gestire i solleciti</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fattura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead>Scadenza</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azione richiesta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibili.map((f) => {
                const c = getCliente(f.clienteId);
                const p = prossimoSollecito(f, oggi);
                const ritardo = giorniTra(oggi, f.dataScadenza);
                return (
                  <TableRow
                    key={f.id}
                    className="cursor-pointer"
                    onClick={() => (window.location.href = `/fatture/${f.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{f.numero}</div>
                      <div className="max-w-50 truncate text-xs text-muted-foreground">
                        {f.descrizione}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c?.ragioneSociale}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {eur(f.importo)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {dataIt(f.dataScadenza)}
                      {f.stato === "scaduta" && (
                        <div
                          className={
                            "text-xs font-medium tabular-nums " +
                            coloreRitardo(ritardo)
                          }
                        >
                          +{ritardo} gg
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatoFatturaBadge stato={f.stato} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p?.dovuto && <LivelloBadge livello={p.livello} />}
                        <span className="max-w-44 text-xs text-muted-foreground">
                          {statoEscalation(f, oggi)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
