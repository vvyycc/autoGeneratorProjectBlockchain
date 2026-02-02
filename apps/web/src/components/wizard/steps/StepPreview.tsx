"use client";

import { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ProjectConfig } from "@sale-factory/shared";

import { themeOptions } from "../../ThemePicker";
import DeployPanel from "../../DeployPanel";
import StepShell from "../StepShell";

type DeploymentsPayload = {
  token?: { address?: string };
  saleManager?: { address?: string };
};

const StepPreview = () => {
  const { watch } = useFormContext<ProjectConfig>();
  const values = watch();
  const [deployments, setDeployments] = useState<DeploymentsPayload | null>(
    null
  );
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const theme = useMemo(() => {
    return themeOptions.find((option) => option.id === values.theme) ??
      themeOptions[0];
  }, [values.theme]);

  const handleCopy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      window.setTimeout(() => {
        setCopiedValue((current) => (current === value ? null : current));
      }, 2000);
    } catch {
      setCopiedValue(null);
    }
  }, []);

  const slug = values.slug?.trim();

  return (
    <StepShell
      title="Preview"
      description="Vista previa de la landing generada con tu configuración."
    >
      <div className={`rounded-2xl border p-6 ${theme.background} ${theme.card}`}>
        <section className="space-y-3">
          <p className={`text-xs uppercase tracking-[0.3em] ${theme.accent}`}>
            {values.ticker}
          </p>
          <h1 className="text-3xl font-semibold">{values.name}</h1>
          <p className="text-sm text-white/80">{values.oneLiner}</p>
          <p className="text-sm text-white/70">{values.description}</p>
          {values.valueProp ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              {values.valueProp}
            </div>
          ) : null}
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Roadmap</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {values.roadmap.map((item) => (
              <div
                key={`${item.title}-${item.dateLabel}`}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  {item.dateLabel}
                </div>
                <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-white/70">
                  {item.description}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Tokenomics</h2>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div>Supply total: {values.tokenomics.totalSupply}</div>
            <div>Decimales: {values.tokenomics.decimals}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {values.tokenomics.allocations.map((allocation) => (
              <div
                key={`${allocation.name}-${allocation.percent}`}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {allocation.name}
                  </span>
                  <span className="text-xs text-white/70">
                    {allocation.percent}%
                  </span>
                </div>
                {allocation.vesting ? (
                  <p className="mt-2 text-xs text-white/70">
                    Vesting: {allocation.vesting}
                  </p>
                ) : null}
                {allocation.cliff ? (
                  <p className="text-xs text-white/60">
                    Cliff: {allocation.cliff}
                  </p>
                ) : null}
                {allocation.notes ? (
                  <p className="mt-2 text-xs text-white/60">
                    {allocation.notes}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Rounds</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {values.rounds.preSales.map((round) => (
              <div
                key={round.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Pre-sale
                </div>
                <h3 className="mt-2 text-sm font-semibold">{round.name}</h3>
                <p className="text-xs text-white/70">
                  {round.start} → {round.end}
                </p>
                <p className="text-xs text-white/70">
                  Precio: {round.price} ({round.acceptedCurrency})
                </p>
              </div>
            ))}
            {values.rounds.publicSales.map((round) => (
              <div
                key={round.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Public
                </div>
                <h3 className="mt-2 text-sm font-semibold">{round.name}</h3>
                <p className="text-xs text-white/70">
                  {round.start} → {round.end}
                </p>
                <p className="text-xs text-white/70">
                  Precio: {round.price} ({round.acceptedCurrency})
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Disclaimers</h2>
          <p className="text-xs text-white/70">
            {values.compliance.disclaimer}
          </p>
          <div className="text-xs text-white/60">
            {values.compliance.kycRequired
              ? "KYC requerido para participar."
              : "KYC no requerido."}
          </div>
          {values.compliance.geoRestrictions.length > 0 ? (
            <div className="text-xs text-white/60">
              Restricciones: {values.compliance.geoRestrictions.join(", ")}
            </div>
          ) : null}
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Token Status</h2>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                Status
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">
                {deployments ? "Deployed" : "Planned"}
              </span>
            </div>
            {deployments ? (
              <div className="mt-3 space-y-2 text-xs text-white/70">
                {deployments.token?.address ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white/80">Token:</span>
                    <span className="truncate">{deployments.token.address}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(deployments.token?.address ?? "")}
                      className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70"
                    >
                      {copiedValue === deployments.token.address
                        ? "Copied"
                        : "Copy"}
                    </button>
                  </div>
                ) : null}
                {deployments.saleManager?.address ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white/80">
                      SaleManager:
                    </span>
                    <span className="truncate">
                      {deployments.saleManager.address}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(deployments.saleManager?.address ?? "")
                      }
                      className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70"
                    >
                      {copiedValue === deployments.saleManager.address
                        ? "Copied"
                        : "Copy"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-xs text-white/60">
                Aún no hay deployments para este proyecto.
              </p>
            )}
          </div>
        </section>
      </div>

      {!slug ? (
        <div className="mt-6 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Save config first.
        </div>
      ) : null}

      {slug ? (
        <DeployPanel
          slug={slug}
          onDeployed={(payload) => setDeployments(payload)}
        />
      ) : null}
    </StepShell>
  );
};

export default StepPreview;
