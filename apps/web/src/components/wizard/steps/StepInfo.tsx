"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { ProjectConfig } from "@sale-factory/shared";

import ThemePicker from "../../ThemePicker";
import StepShell from "../StepShell";

const StepInfo = () => {
  const { register, control } = useFormContext<ProjectConfig>();

  return (
    <StepShell
      title="Información general"
      description="Define la identidad del proyecto y la narrativa principal."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-200">
          Nombre del proyecto
          <input
            {...register("name")}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Atlas Chain"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Slug
          <input
            {...register("slug")}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="atlas-chain"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Ticker
          <input
            {...register("ticker")}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="ATLAS"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Chain objetivo
          <input
            {...register("chainTarget")}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Ethereum"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-200">
        One-liner
        <input
          {...register("oneLiner")}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          placeholder="Infraestructura modular para activos tokenizados."
        />
      </label>

      <label className="space-y-2 text-sm text-slate-200">
        Descripción
        <textarea
          {...register("description")}
          className="min-h-[120px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          placeholder="Cuenta la historia del proyecto y su misión."
        />
      </label>

      <label className="space-y-2 text-sm text-slate-200">
        Propuesta de valor (opcional)
        <textarea
          {...register("valueProp")}
          className="min-h-[90px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          placeholder="Beneficios clave para inversores y usuarios."
        />
      </label>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Compliance</h3>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            {...register("compliance.kycRequired")}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950"
          />
          KYC requerido
        </label>
        <Controller
          control={control}
          name="compliance.geoRestrictions"
          render={({ field }) => (
            <label className="space-y-2 text-sm text-slate-200">
              Restricciones geográficas (separadas por coma)
              <input
                value={field.value.join(", ")}
                onChange={(event) =>
                  field.onChange(
                    event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                placeholder="US, CN"
              />
            </label>
          )}
        />
        <label className="space-y-2 text-sm text-slate-200">
          Disclaimer
          <textarea
            {...register("compliance.disclaimer")}
            className="min-h-[90px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Theme</h3>
        <Controller
          control={control}
          name="theme"
          render={({ field }) => (
            <ThemePicker
              value={field.value}
              onChange={field.onChange}
              helper="Selecciona el tono visual para la landing."
            />
          )}
        />
      </div>
    </StepShell>
  );
};

export default StepInfo;
