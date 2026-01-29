"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProjectConfig } from "@sale-factory/shared";

import StepShell from "../StepShell";

const StepTokenomics = () => {
  const { control, register, watch } = useFormContext<ProjectConfig>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tokenomics.allocations"
  });

  const allocations = watch("tokenomics.allocations");
  const percentUsed = allocations.reduce(
    (total, allocation) => total + (allocation?.percent ?? 0),
    0
  );

  return (
    <StepShell
      title="Tokenomics"
      description="Configura el supply y las asignaciones del token."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-200">
          Supply total
          <input
            {...register("tokenomics.totalSupply")}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="1000000000"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Decimales
          <input
            type="number"
            {...register("tokenomics.decimals", { valueAsNumber: true })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span>Percent used: {percentUsed}%</span>
        {percentUsed > 100 ? (
          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs text-rose-200">
            Supera 100%
          </span>
        ) : null}
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Allocation {index + 1}
              </h3>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-xs text-rose-300 hover:text-rose-200"
              >
                Eliminar
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                Nombre
                <input
                  {...register(`tokenomics.allocations.${index}.name`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Percent
                <input
                  type="number"
                  {...register(`tokenomics.allocations.${index}.percent`, {
                    valueAsNumber: true
                  })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Vesting (opcional)
                <input
                  {...register(`tokenomics.allocations.${index}.vesting`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Cliff (opcional)
                <input
                  {...register(`tokenomics.allocations.${index}.cliff`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                Notas (opcional)
                <textarea
                  {...register(`tokenomics.allocations.${index}.notes`)}
                  className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          append({
            name: "",
            percent: 0,
            vesting: "",
            cliff: "",
            notes: ""
          })
        }
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
      >
        Agregar allocation
      </button>
    </StepShell>
  );
};

export default StepTokenomics;
