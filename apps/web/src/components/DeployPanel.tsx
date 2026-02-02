"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { deployProject, getDeployments, getProject } from "../lib/api";

type DeploymentRound = {
  kind: string;
  name: string;
  start: string;
  end: string;
  hardCapTokens: string;
  priceWeiPerToken: string;
  whitelistEnabled: boolean;
  vestingEnabled: boolean;
};

type DeploymentsPayload = {
  token: { address: string };
  saleManager: { address: string };
  network: string;
  chainId: number;
  deployedAt: string;
  rounds: DeploymentRound[];
};

type DeployPanelProps = {
  slug: string;
  onDeployed?: (deployments: DeploymentsPayload | null) => void;
};

const networkOptions = ["localhost", "sepolia", "amoy", "bscTestnet"];

const DeployPanel = ({ slug, onDeployed }: DeployPanelProps) => {
  const [network, setNetwork] = useState("localhost");
  const [deployments, setDeployments] = useState<DeploymentsPayload | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectExists, setProjectExists] = useState<boolean | null>(null);

  const canDeploy = useMemo(() => {
    return !isLoading && projectExists !== false;
  }, [isLoading, projectExists]);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const loadDeployments = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!slug) {
        return;
      }
      if (!options?.silent) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const response = await getDeployments(slug);
        const payload = response.deployments as DeploymentsPayload;
        setDeployments(payload);
        onDeployed?.(payload);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Request failed";
        if (message.toLowerCase().includes("not found")) {
          setDeployments(null);
          onDeployed?.(null);
          setError(null);
        } else {
          handleError(message);
        }
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [handleError, onDeployed, slug]
  );

  const checkProjectExists = useCallback(async () => {
    if (!slug) {
      setProjectExists(false);
      return;
    }
    try {
      await getProject(slug);
      setProjectExists(true);
    } catch {
      setProjectExists(false);
    }
  }, [slug]);

  const handleDeploy = useCallback(async () => {
    if (!slug) {
      handleError("Guarda el config antes de desplegar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await getProject(slug);
      setProjectExists(true);
    } catch (projectError) {
      handleError("Guarda el config antes de desplegar.");
      setProjectExists(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await deployProject(slug, network);
      const payload = response.deployments as DeploymentsPayload;
      setDeployments(payload);
      onDeployed?.(payload);
    } catch (deployError) {
      const message =
        deployError instanceof Error ? deployError.message : "Request failed";
      handleError(message);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, network, onDeployed, slug]);

  useEffect(() => {
    setDeployments(null);
    setError(null);
    setProjectExists(null);
    void checkProjectExists();
    void loadDeployments({ silent: true });
  }, [checkProjectExists, loadDeployments, slug]);

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Deploy contracts</h3>
          <p className="text-xs text-white/60">
            Selecciona la red y despliega los contratos del proyecto.
          </p>
        </div>
        {deployments ? (
          <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
            Deployed
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          Network
        </label>
        <select
          value={network}
          onChange={(event) => setNetwork(event.target.value)}
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          {networkOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleDeploy}
          disabled={!canDeploy}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-white/20"
        >
          Deploy contracts
        </button>
        <button
          type="button"
          onClick={() => loadDeployments()}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
        >
          Refresh deployments
        </button>
        {isLoading ? (
          <span className="inline-flex items-center gap-2 text-xs text-white/70">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            Loading
          </span>
        ) : null}
      </div>

      {projectExists === false ? (
        <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Guarda el config antes de desplegar.
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {deployments ? (
        <div className="mt-6 space-y-4 text-sm text-white/80">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                Token
              </div>
              <div className="mt-2 text-sm font-semibold">
                {deployments.token.address}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                Sale manager
              </div>
              <div className="mt-2 text-sm font-semibold">
                {deployments.saleManager.address}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                Network
              </div>
              <div className="mt-2 text-sm font-semibold">
                {deployments.network} (chainId {deployments.chainId})
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                Deployed at
              </div>
              <div className="mt-2 text-sm font-semibold">
                {deployments.deployedAt}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Rounds</h4>
            <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-xs text-white/70">
                <thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-white/60">
                  <tr>
                    <th className="px-3 py-2">Kind</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Start</th>
                    <th className="px-3 py-2">End</th>
                    <th className="px-3 py-2">Hard cap tokens</th>
                    <th className="px-3 py-2">Price wei/token</th>
                    <th className="px-3 py-2">Whitelist</th>
                    <th className="px-3 py-2">Vesting</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.rounds.map((round) => (
                    <tr key={`${round.kind}-${round.name}`} className="border-t border-white/10">
                      <td className="px-3 py-2">{round.kind}</td>
                      <td className="px-3 py-2">{round.name}</td>
                      <td className="px-3 py-2">{round.start}</td>
                      <td className="px-3 py-2">{round.end}</td>
                      <td className="px-3 py-2">{round.hardCapTokens}</td>
                      <td className="px-3 py-2">{round.priceWeiPerToken}</td>
                      <td className="px-3 py-2">
                        {round.whitelistEnabled ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2">
                        {round.vestingEnabled ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-white/60">
          Aún no hay deployments registrados para este proyecto.
        </p>
      )}
    </div>
  );
};

export default DeployPanel;
