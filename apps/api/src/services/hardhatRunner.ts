import { spawn } from "node:child_process";

import { repoRoot } from "../utils/paths";

const LOG_TAIL_LIMIT = 4000;

const tailLogs = (logs: string): string => {
  if (logs.length <= LOG_TAIL_LIMIT) {
    return logs;
  }

  return logs.slice(-LOG_TAIL_LIMIT);
};

export const runHardhatDeploy = async (params: {
  slug: string;
  network: string;
}): Promise<void> => {
  const network = params.network?.trim();

  if (!network) {
    throw new Error("Network is required.");
  }

  const command = `pnpm --filter ./apps/hardhat deploy -- --network ${network} --slug ${params.slug}`;

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, {
      cwd: repoRoot(),
      env: { ...process.env, PROJECT_SLUG: params.slug },
      shell: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      const logs = tailLogs(`${stdout}\n${stderr}`);
      reject(new Error(`Failed to start Hardhat deploy: ${error.message}\n${logs}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const logs = tailLogs(`${stdout}\n${stderr}`);
      reject(new Error(`Hardhat deploy failed with code ${code ?? "unknown"}.\n${logs}`));
    });
  });
};
