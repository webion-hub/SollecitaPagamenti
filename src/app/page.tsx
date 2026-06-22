"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { eur, giorniTra, dataIt } from "@/lib/format";
import { prossimoSollecito } from "@/lib/scoring";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LivelloBadge } from "@/components/badges";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BanknoteArrowDown,
  Clock,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { fatture, oggi, getCliente, eseguiSollecitiAutomatici } = useStore();

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

  const handleAuto = () => {
    const n = eseguiSollecitiAutomatici();
    if (n > 0)
      toast.success(`${n} sollecito/i inviati automaticamente`, {
        description: "Email / PEC / WhatsApp simulati secondo l'escalation.",
      });
    else
      toast.info("Nessun sollecito dovuto oggi", {
        description: "Avanza il tempo per far maturare le scadenze.",
      });
  };

  return (
    <div className="space-y-8">
      {/* Header situazionale: orienta sullo stato di oggi, non slogan di prodotto */}
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Riepilogo al {dataIt(oggi)}
          </h1>
          <p className="text-muted-foreground">
            {dovuti.length > 0 ? (
              <>
                <span className="font-semibold text-foreground">
                  {dovuti.length} solleciti
                </span>{" "}
                da inviare oggi
              </>
            ) : (
              "Nessun sollecito da inviare oggi"
            )}{" "}
            ·{" "}
            <span className="font-semibold text-red-600 dark:text-red-400">
              {eur(totScaduto)}
            </span>{" "}
            di insoluto scaduto
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleAuto}
          disabled={dovuti.length === 0}
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
      </div>

      {/* Solleciti da inviare */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            Solleciti da inviare
          </CardTitle>
          <CardDescription>
            {dovuti.length === 0
              ? "Nessun sollecito dovuto: usa «Esegui solleciti automatici» o avanza il tempo."
              : "Fatture che hanno raggiunto la data del prossimo avviso."}
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

      {/* KPI: sotto il componente dei solleciti */}
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
          tone={
            giorniScoperto > 90
              ? "danger"
              : giorniScoperto > 60
                ? "warning"
                : undefined
          }
        />
      </div>

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
  tone?: "danger" | "warning" | "ok";
}) {
  const iconColor =
    tone === "danger"
      ? "text-red-500"
      : tone === "warning"
        ? "text-orange-500"
        : tone === "ok"
          ? "text-emerald-500"
          : "text-primary";
  const valueColor =
    tone === "danger"
      ? "text-red-600 dark:text-red-400"
      : tone === "warning"
        ? "text-orange-600 dark:text-orange-400"
        : tone === "ok"
          ? "text-emerald-600 dark:text-emerald-400"
          : "";
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={iconColor}>{icon}</span>
          {label}
        </div>
        <div
          className={
            "mt-2 text-2xl font-semibold tracking-tight tabular-nums " + valueColor
          }
        >
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
