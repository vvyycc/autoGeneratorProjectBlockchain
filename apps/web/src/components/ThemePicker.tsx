"use client";

import type { ReactNode } from "react";

export type ThemeOption = {
  id: string;
  label: string;
  description: string;
  background: string;
  accent: string;
  card: string;
  button: string;
};

export const themeOptions: ThemeOption[] = [
  {
    id: "nature",
    label: "Nature",
    description: "Verde profundo con acentos de bosque.",
    background: "bg-emerald-950 text-emerald-50",
    accent: "text-emerald-300",
    card: "bg-emerald-900/40 border-emerald-800",
    button: "bg-emerald-400 text-emerald-950"
  },
  {
    id: "real-estate",
    label: "Real Estate",
    description: "Azules sobrios para activos reales.",
    background: "bg-slate-950 text-slate-50",
    accent: "text-sky-300",
    card: "bg-slate-900/60 border-slate-700",
    button: "bg-sky-400 text-slate-950"
  },
  {
    id: "gaming",
    label: "Gaming",
    description: "Púrpuras vibrantes con energía.",
    background: "bg-violet-950 text-violet-50",
    accent: "text-fuchsia-300",
    card: "bg-violet-900/50 border-violet-700",
    button: "bg-fuchsia-400 text-violet-950"
  },
  {
    id: "ai",
    label: "AI",
    description: "Minimal tech con toques neón.",
    background: "bg-slate-950 text-slate-50",
    accent: "text-cyan-300",
    card: "bg-slate-900/60 border-slate-700",
    button: "bg-cyan-400 text-slate-950"
  },
  {
    id: "carbon",
    label: "Carbon",
    description: "Carbono con acentos verdes.",
    background: "bg-neutral-950 text-neutral-50",
    accent: "text-lime-300",
    card: "bg-neutral-900/60 border-neutral-700",
    button: "bg-lime-400 text-neutral-950"
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "Negros intensos con dorado.",
    background: "bg-stone-950 text-stone-50",
    accent: "text-amber-300",
    card: "bg-stone-900/60 border-stone-700",
    button: "bg-amber-400 text-stone-950"
  }
];

type ThemePickerProps = {
  value: string;
  onChange: (value: string) => void;
  helper?: ReactNode;
};

const ThemePicker = ({ value, onChange, helper }: ThemePickerProps) => {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {themeOptions.map((theme) => {
          const isActive = value === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className={`rounded-xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                isActive
                  ? "border-white/80 bg-white/10"
                  : "border-slate-700 bg-slate-900/40 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {theme.label}
                </span>
                {isActive ? (
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-200">
                    Activo
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-slate-300">
                {theme.description}
              </p>
              <div
                className={`mt-3 rounded-lg border px-3 py-2 text-xs ${theme.background} ${theme.card}`}
              >
                <div className={`font-medium ${theme.accent}`}>
                  Vista previa
                </div>
                <div className="mt-1 opacity-80">
                  {theme.id}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {helper ? <div className="text-xs text-slate-400">{helper}</div> : null}
    </div>
  );
};

export default ThemePicker;
