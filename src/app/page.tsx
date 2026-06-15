"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { eur, giorniTra, dataIt } from "@/lib/format";
import { prossimoSollecito, statoEscalation } from "@/lib/scoring";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatoFatturaBadge, LivelloBadge } from "@/components/badges";
import {
  AlertTriangle,
  ArrowRight,
  BanknoteArrowDown,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const { fatture, oggi, getCliente } = useStore();

  const scadute = fatture.filter((f) => f.stato === "scaduta");
  const inAttesa = fatture.filter((f) => f.stato === "in_attesa");
  const pagate = fatture.filter((f) => f.stato === "pagata");

  const totScaduto = scadute.reduce((s, f) => s + f.importo, 0);
  const totInAttesa = inAttesa.reduce((s, f) => s + f.importo, 0);
  const totIncassato = pagate.reduce((s, f) => s + f.importo, 0);

  const giorniScoperto = scadute.length
    ? Math.round(
        scadute.reduce((s, f) => s + giorniTra(oggi, f.dataScadenza), 0) /
          scadute.length,
      )
    : 0;

  const dovuti = fatture
    .map((f) => ({ f, p: prossimoSollecito(f, oggi) }))
    .filter((x) => x.p && x.p.dovuto);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard cash flow
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitoraggio insoluti e solleciti automatici al {dataIt(oggi)}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<BanknoteArrowDown className="size-4" />}
          label="Insoluto scaduto"
          value={eur(totScaduto)}
          sub={`${scadute.length} fatture scadute`}
          tone="danger"
        />
        <Kpi
          icon={<Clock className="size-4" />}
          label="In attesa (a scadere)"
          value={eur(totInAttesa)}
          sub={`${inAttesa.length} fatture aperte`}
        />
        <Kpi
          icon={<Wallet className="size-4" />}
          label="Incassato"
          value={eur(totIncassato)}
          sub={`${pagate.length} fatture saldate`}
          tone="ok"
        />
        <Kpi
          icon={<TrendingUp className="size-4" />}
          label="Giorni medi di scoperto"
          value={`${giorniScoperto} gg`}
          sub="media sulle scadute (DSO)"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            Solleciti da inviare
          </CardTitle>
          <CardDescription>
            {dovuti.length === 0
              ? "Nessun sollecito dovuto: usa «Esegui solleciti automatici» o avanza il tempo."
              : `${dovuti.length} fatture richiedono un sollecito oggi.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {dovuti.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tutto sotto controllo 🎉
            </p>
          )}
          {dovuti.map(({ f, p }) => {
            const c = getCliente(f.clienteId);
            return (
              <Link
                key={f.id}
                href={`/fatture/${f.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{c?.ragioneSociale}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {f.numero} · scaduta da {giorniTra(oggi, f.dataScadenza)} gg
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold">{eur(f.importo)}</span>
                  {p && <LivelloBadge livello={p.livello} />}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insoluti aperti</CardTitle>
          <CardDescription>
            Stato dell&apos;iter di sollecito per fattura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {scadute.map((f) => {
            const c = getCliente(f.clienteId);
            return (
              <Link
                key={f.id}
                href={`/fatture/${f.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="font-medium">{c?.ragioneSociale}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.numero} · {statoEscalation(f, oggi)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatoFatturaBadge stato={f.stato} />
                  <span className="font-semibold">{eur(f.importo)}</span>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "danger" | "ok";
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className={
              tone === "danger"
                ? "text-red-500"
                : tone === "ok"
                  ? "text-emerald-500"
                  : "text-muted-foreground"
            }
          >
            {icon}
          </span>
          {label}
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
