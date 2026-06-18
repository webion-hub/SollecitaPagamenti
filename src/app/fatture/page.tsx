"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { prossimoSollecito, statoEscalation } from "@/lib/scoring";
import { eur, dataIt, giorniTra } from "@/lib/format";
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

export default function FatturePage() {
  const { fatture, oggi, getCliente } = useStore();
  const [filtro, setFiltro] = useState<(typeof FILTRI)[number]["key"]>("tutte");

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
          Iter graduale automatico: primo avviso → secondo avviso → ultimo avviso, max 3
          solleciti con 7 giorni di margine.
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
                <TableHead>Stato iter</TableHead>
                <TableHead className="text-center">Prossimo</TableHead>
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
                    <TableCell className="text-right font-medium">
                      {eur(f.importo)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {dataIt(f.dataScadenza)}
                      {f.stato === "scaduta" && (
                        <div className="text-xs text-red-500">
                          +{ritardo} gg
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatoFatturaBadge stato={f.stato} />
                      <div className="mt-1 max-w-44 text-xs text-muted-foreground">
                        {statoEscalation(f, oggi)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {p?.dovuto ? (
                        <LivelloBadge livello={p.livello} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
