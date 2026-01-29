"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProjectConfig } from "@sale-factory/shared";

import StepShell from "../StepShell";

const StepRoadmap = () => {
  const { control, register } = useFormContext<ProjectConfig>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "roadmap"
  });

  return (
    <StepShell
      title="Roadmap"
      description="Organiza las entregas clave del proyecto."
    >
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Hito {index + 1}
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
                Título
                <input
                  {...register(`roadmap.${index}.title`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Fecha
                <input
                  {...register(`roadmap.${index}.dateLabel`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  placeholder="Q3 2024"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                Descripción
                <textarea
                  {...register(`roadmap.${index}.description`)}
                  className="min-h-[90px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Estado
                <select
                  {...register(`roadmap.${index}.status`)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="PLANNED">Planeado</option>
                  <option value="IN_PROGRESS">En progreso</option>
                  <option value="DONE">Completado</option>
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          append({
            title: "Nuevo hito",
            description: "",
            dateLabel: "",
            status: "PLANNED"
          })
        }
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
      >
        Agregar hito
      </button>
    </StepShell>
  );
};

export default StepRoadmap;
