"use client";

import { Canale, LABEL_CANALE } from "@/lib/types";
import { Check, Mail, MessageCircle, ShieldCheck } from "lucide-react";

const CANALE_ICON: Record<Canale, React.ReactNode> = {
  email: <Mail className="size-4" />,
  pec: <ShieldCheck className="size-4" />,
  whatsapp: <MessageCircle className="size-4" />,
};

const CANALI: Canale[] = ["email", "pec", "whatsapp"];

/** Selettore multi-canale (email / PEC / WhatsApp) con stato a checkbox. */
export function CanaliPicker({
  canali,
  consigliati,
  onToggle,
  disabled,
}: {
  canali: Canale[];
  consigliati?: Canale[];
  onToggle: (c: Canale) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CANALI.map((c) => {
        const attivo = canali.includes(c);
        const consigliato = consigliati?.includes(c);
        return (
          <button
            key={c}
            type="button"
            role="checkbox"
            aria-checked={attivo}
            disabled={disabled}
            onClick={() => onToggle(c)}
            className={
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 " +
              (attivo
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-muted")
            }
          >
            <span className="flex size-4 shrink-0 items-center justify-center">
              {attivo ? <Check className="size-4" /> : CANALE_ICON[c]}
            </span>
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
  );
}
