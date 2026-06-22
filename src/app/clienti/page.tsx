"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { calcolaAffidabilita } from "@/lib/scoring";
import { eur, iniziali, coloreAvatar } from "@/lib/format";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AffidabilitaBadge, AffidabilitaBar } from "@/components/badges";
import { ArrowRight } from "lucide-react";

export default function ClientiPage() {
  const { clienti, fatture, oggi } = useStore();

  const righe = clienti
    .map((c) => {
      const mie = fatture.filter((f) => f.clienteId === c.id);
      const aperto = mie
        .filter((f) => f.stato === "scaduta" || f.stato === "in_attesa")
        .reduce((s, f) => s + f.importo, 0);
      const solleciti = mie.reduce((s, f) => s + f.solleciti.length, 0);
      const aff = calcolaAffidabilita(c, fatture, oggi);
      return { c, aperto, solleciti, aff, nFatture: mie.length };
    })
    .sort((a, b) => a.aff.punteggio - b.aff.punteggio);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Clienti & scoring affidabilità
        </h1>
        <p className="text-sm text-muted-foreground">
          Il punteggio (0–10) scende con i ritardi e con il numero/intensità dei
          solleciti inviati. Ordinati dal più critico.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portafoglio clienti</CardTitle>
          <CardDescription>{clienti.length} clienti monitorati</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Esposto aperto</TableHead>
                <TableHead className="text-center">Fatture</TableHead>
                <TableHead className="text-center">Solleciti</TableHead>
                <TableHead className="text-right">Affidabilità</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {righe.map(({ c, aperto, solleciti, aff, nFatture }) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => (window.location.href = `/clienti/${c.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className={coloreAvatar(c.id)}>
                          {iniziali(c.ragioneSociale)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{c.ragioneSociale}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.referente} · {c.citta}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {eur(aperto)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {nFatture}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {solleciti}
                  </TableCell>
                  <TableCell>
                    <div className="ml-auto flex w-32 flex-col items-end gap-1.5">
                      <AffidabilitaBadge a={aff} />
                      <AffidabilitaBar a={aff} className="w-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/clienti/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Apri dettaglio di ${c.ragioneSociale}`}
                    >
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
