"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { dataIt } from "@/lib/format";
import { OGGI } from "@/lib/seed";
import { prossimoSollecito } from "@/lib/scoring";
import { toast } from "sonner";
import {
  BellRing,
  CalendarClock,
  History,
  LayoutDashboard,
  Receipt,
  RotateCcw,
  Users,
  Zap,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fatture", label: "Fatture & Solleciti", icon: Receipt },
  { href: "/clienti", label: "Clienti & Scoring", icon: Users },
  { href: "/storico", label: "Storico attività", icon: History },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    oggi,
    fatture,
    avanzaTempo,
    tornaAOggi,
    eseguiSollecitiAutomatici,
    reset,
  } = useStore();
  const dataSpostata = oggi !== OGGI;

  const dovuti = fatture.filter((f) => prossimoSollecito(f, oggi)?.dovuto).length;

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

  const handleAvanza = (g: number) => {
    avanzaTempo(g);
    toast(`Avanzato di ${g} giorni`, { description: "Scadenze ricalcolate." });
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start overflow-y-auto border-r bg-card md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BellRing className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">SollecitaPro</div>
            <div className="text-xs text-muted-foreground">Crediti & cash flow</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-xs text-muted-foreground"
            onClick={() => {
              reset();
              toast("Dati demo ripristinati");
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset dati demo
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Command bar: il motore dei solleciti automatici, sempre in primo piano */}
        <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-8">
            {/* brand mobile */}
            <Link href="/" className="flex items-center gap-2 font-semibold md:hidden">
              <BellRing className="size-5" /> SollecitaPro
            </Link>

            {/* CTA principale: solleciti automatici */}
            <Button
              size="lg"
              onClick={handleAuto}
              className="relative gap-2 shadow-sm"
            >
              <Zap className="size-4" />
              Esegui solleciti automatici
              {dovuti > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-xs font-semibold text-foreground">
                  {dovuti}
                </span>
              )}
            </Button>
            <span className="hidden text-sm text-muted-foreground lg:inline">
              {dovuti > 0
                ? `${dovuti} fatture pronte al sollecito`
                : "Nessun sollecito dovuto adesso"}
            </span>

            {/* Simulazione tempo: avanza la data per dimostrare l'escalation */}
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden flex-col items-end leading-tight sm:flex">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarClock className="size-3" /> Tempo simulato
                </span>
                <span className="text-sm font-medium">{dataIt(oggi)}</span>
              </div>
              <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2"
                  title="Avanza la data simulata di 7 giorni: fa maturare scadenze e solleciti"
                  onClick={() => handleAvanza(7)}
                >
                  +7 gg
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-7 gap-1 px-2 sm:inline-flex"
                  title="Avanza la data simulata di 30 giorni"
                  onClick={() => handleAvanza(30)}
                >
                  +30 gg
                </Button>
                {dataSpostata && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 px-2"
                    title="Riporta la simulazione alla data odierna"
                    onClick={() => {
                      tornaAOggi();
                      toast("Tornato alla data odierna", {
                        description: dataIt(OGGI),
                      });
                    }}
                  >
                    <RotateCcw className="size-3.5" /> Oggi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* nav mobile */}
        <nav className="flex gap-1 overflow-x-auto border-b bg-card px-2 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
