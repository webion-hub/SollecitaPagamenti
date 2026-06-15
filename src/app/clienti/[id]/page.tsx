"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { calcolaAffidabilita, statoEscalation } from "@/lib/scoring";
import { eur, iniziali, dataIt } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AffidabilitaBadge, StatoFatturaBadge } from "@/components/badges";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getCliente, fattureCliente, fatture, oggi } = useStore();
  const cliente = getCliente(id);

  if (!cliente)
    return (
      <div className="mx-auto max-w-3xl py-16 text-center text-muted-foreground">
        Cliente non trovato.{" "}
        <Link href="/clienti" className="underline">
          Torna ai clienti
        </Link>
      </div>
    );

  const mie = fattureCliente(cliente.id);
  const aff = calcolaAffidabilita(cliente, fatture, oggi);
  const aperto = mie
    .filter((f) => f.stato === "scaduta" || f.stato === "in_attesa")
    .reduce((s, f) => s + f.importo, 0);
  const nSolleciti = mie.reduce((s, f) => s + f.solleciti.length, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/clienti"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Clienti
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">
              {iniziali(cliente.ragioneSociale)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {cliente.ragioneSociale}
            </h1>
            <p className="text-sm text-muted-foreground">
              Referente: {cliente.referente}
            </p>
          </div>
        </div>
        <AffidabilitaBadge a={aff} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Scoring affidabilità</CardTitle>
            <CardDescription>Aggiornato al {dataIt(oggi)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-semibold">
                  {aff.punteggio.toLocaleString("it-IT")}
                </span>
                <span className="text-sm text-muted-foreground">/ 10</span>
              </div>
              <Progress value={aff.punteggio * 10} className="mt-2" />
              <p className="mt-2 text-sm text-muted-foreground">
                Fascia: <span className="font-medium text-foreground">{aff.label}</span>
              </p>
            </div>
            <dl className="space-y-1 text-sm">
              <Riga label="Esposto aperto" value={eur(aperto)} />
              <Riga label="Fatture totali" value={String(mie.length)} />
              <Riga label="Solleciti inviati" value={String(nSolleciti)} />
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contatti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" /> {cliente.email}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" /> {cliente.pec}{" "}
              <span className="text-xs text-muted-foreground">(PEC)</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" /> {cliente.telefono}{" "}
              <span className="text-xs text-muted-foreground">(WhatsApp)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" /> {cliente.citta}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fatture del cliente</CardTitle>
          <CardDescription>{mie.length} documenti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {mie.map((f) => (
            <Link
              key={f.id}
              href={`/fatture/${f.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 hover:bg-muted/50"
            >
              <div className="min-w-0">
                <div className="font-medium">
                  {f.numero} · {f.descrizione}
                </div>
                <div className="text-xs text-muted-foreground">
                  Scad. {dataIt(f.dataScadenza)} · {statoEscalation(f, oggi)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatoFatturaBadge stato={f.stato} />
                <span className="font-semibold">{eur(f.importo)}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Riga({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
