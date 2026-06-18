"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { dataIt } from "@/lib/format";
import { OGGI } from "@/lib/seed";
import { toast } from "sonner";
import {
  CalendarClock,
  History,
  LayoutDashboard,
  Receipt,
  RotateCcw,
  Users,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fatture", label: "Fatture", icon: Receipt },
  { href: "/clienti", label: "Clienti", icon: Users },
  { href: "/storico", label: "Storico", icon: History },
];

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Pill nav with an indicator that slides to the active tab. */
function TabNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  const recompute = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>("[data-active='true']");
    if (active) {
      setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    }
  }, []);

  useEffect(recompute, [recompute, pathname]);

  useEffect(() => {
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [recompute]);

  return (
    <div
      ref={listRef}
      className={cn(
        "relative flex items-center gap-1 overflow-x-auto rounded-full bg-muted/60 p-1",
        className,
      )}
    >
      {indicator && (
        <span
          aria-hidden
          className="absolute inset-y-1 z-0 rounded-full bg-card shadow-sm ring-1 ring-border transition-[left,width] duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {NAV.map((item) => {
        const active = isActive(item.href, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active}
            className={cn(
              "relative z-10 flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { oggi, avanzaTempo, tornaAOggi, reset } = useStore();
  const dataSpostata = oggi !== OGGI;

  const handleAvanza = (g: number) => {
    avanzaTempo(g);
    toast(`Avanzato di ${g} giorni`, { description: "Scadenze ricalcolate." });
  };

  return (
    <div className="app-surface min-h-screen">
      {/* Floating header: brand · tab nav · simulazione tempo */}
      <header className="sticky top-0 z-30 px-3 pt-3 md:px-6 md:pt-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 rounded-2xl border bg-card/80 px-3 py-2.5 shadow-lg shadow-foreground/5 backdrop-blur supports-backdrop-filter:bg-card/70">
          <Link href="/" className="flex items-center gap-2.5 pl-1.5 pr-1">
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold">SollecitaPro</span>
              <span className="block text-[11px] text-muted-foreground">
                Crediti &amp; cash flow
              </span>
            </span>
          </Link>

          <TabNav className="mx-auto" />

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden flex-col items-end leading-tight lg:flex">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarClock className="size-3" /> Tempo simulato
              </span>
              <span className="text-sm font-medium">{dataIt(oggi)}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full border bg-background p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-full px-2.5"
                title="Avanza la data simulata di 7 giorni: fa maturare scadenze e solleciti"
                onClick={() => handleAvanza(7)}
              >
                +7 gg
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden h-7 rounded-full px-2.5 sm:inline-flex"
                title="Avanza la data simulata di 30 giorni"
                onClick={() => handleAvanza(30)}
              >
                +30 gg
              </Button>
              {dataSpostata && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 rounded-full px-2.5"
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
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground"
              title="Ripristina i dati demo"
              onClick={() => {
                reset();
                toast("Dati demo ripristinati");
              }}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
