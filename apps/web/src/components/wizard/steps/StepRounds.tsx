"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProjectConfig, Round } from "@sale-factory/shared";

import StepShell from "../StepShell";

const createRound = (kind: Round["kind"]): Round => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: "",
  kind,
  start: "",
  end: "",
  price: "",
  hardCap: "",
  minBuy: "",
  maxBuy: "",
  acceptedCurrency: "USDT",
  whitelistEnabled: false,
  vestingEnabled: false
});

type RoundSectionProps = {
  title: string;
  name: "rounds.preSales" | "rounds.publicSales";
  kind: Round["kind"];
};

const RoundSection = ({ title, name, kind }: RoundSectionProps) => {
  const { control, register } = useFormContext<ProjectConfig>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <button
          type="button"
          onClick={() => append(createRound(kind))}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500"
        >
          Agregar round
        </button>
      </div>
      {fields.length === 0 ? (
        <p className="text-sm text-slate-400">
          Aún no hay rounds configuradas para esta sección.
        </p>
      ) : null}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-white">
                Round {index + 1}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === fields.length - 1}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs text-rose-300 hover:text-rose-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                Nombre
                <input
                  {...register(`${name}.${index}.name`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Precio
                <input
                  {...register(`${name}.${index}.price`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Inicio
                <input
                  {...register(`${name}.${index}.start`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  placeholder="2024-05-01T00:00:00.000Z"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Fin
                <input
                  {...register(`${name}.${index}.end`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  placeholder="2024-05-20T00:00:00.000Z"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Hard cap
                <input
                  {...register(`${name}.${index}.hardCap`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Min buy
                <input
                  {...register(`${name}.${index}.minBuy`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Max buy
                <input
                  {...register(`${name}.${index}.maxBuy`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Moneda aceptada
                <select
                  {...register(`${name}.${index}.acceptedCurrency`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  {...register(`${name}.${index}.whitelistEnabled`)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-950"
                />
                Whitelist habilitada
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  {...register(`${name}.${index}.vestingEnabled`)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-950"
                />
                Vesting habilitado
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StepRounds = () => {
  return (
    <StepShell
      title="Rounds"
      description="Gestiona presales y public sales con orden y detalles."
    >
      <RoundSection title="Pre-sales" name="rounds.preSales" kind="PRESALE" />
      <RoundSection title="Public sales" name="rounds.publicSales" kind="PUBLIC" />
    </StepShell>
  );
};

export default StepRounds;
