import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const criticalPaths = [
  "packages/shared/src/schema.ts",
  "packages/shared/src/types.ts",
  "packages/shared/src/index.ts",
  "apps/web/src/components/wizard/Wizard.tsx",
  "apps/web/src/components/wizard/steps/StepInfo.tsx",
  "apps/web/src/components/wizard/steps/StepRoadmap.tsx",
  "apps/web/src/components/wizard/steps/StepTokenomics.tsx",
  "apps/web/src/components/wizard/steps/StepRounds.tsx",
  "apps/web/src/components/wizard/steps/StepPreview.tsx",
  "apps/api/src",
  "apps/hardhat/hardhat.config.ts"
];

const runCmd = (cmdString) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmdString, {
      stdio: "inherit",
      shell: true
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(code);
        return;
      }

      const exitCode = code ?? 1;
      const error = new Error(
        `Command failed: ${cmdString} (exit code ${exitCode})`
      );
      error.code = exitCode;
      reject(error);
    });
  });

const exists = (targetPath) => fs.existsSync(path.join(rootDir, targetPath));

const prettyPrint = (results) => {
  console.log("\nVerification Report:");
  for (const result of results) {
    const icon = result.ok ? "✅" : "❌";
    console.log(`${icon} ${result.label}`);
  }
};

const collectWorkspacePackages = () => {
  const roots = ["apps", "packages"];
  const packages = [];

  for (const base of roots) {
    const basePath = path.join(rootDir, base);

    if (!fs.existsSync(basePath)) {
      continue;
    }

    const entries = fs.readdirSync(basePath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageJsonPath = path.join(basePath, entry.name, "package.json");

      if (fs.existsSync(packageJsonPath)) {
        packages.push(packageJsonPath);
      }
    }
  }

  return packages;
};

const hasScript = (scriptName) => {
  const packageJsonPaths = [
    path.join(rootDir, "package.json"),
    ...collectWorkspacePackages()
  ];

  for (const packageJsonPath of packageJsonPaths) {
    try {
      const raw = fs.readFileSync(packageJsonPath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed?.scripts?.[scriptName]) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
};

const hasHardhatTest = () => {
  const hardhatPackagePath = path.join(rootDir, "apps/hardhat/package.json");

  if (!fs.existsSync(hardhatPackagePath)) {
    return false;
  }

  try {
    const raw = fs.readFileSync(hardhatPackagePath, "utf8");
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.scripts?.test);
  } catch {
    return false;
  }
};

const main = async () => {
  const results = [];
  let failed = false;

  for (const targetPath of criticalPaths) {
    const ok = exists(targetPath);
    results.push({
      label: `exists ${targetPath}`,
      ok
    });
    if (!ok) {
      failed = true;
    }
  }

  const commands = [
    { label: "pnpm -r typecheck", cmd: "pnpm -r typecheck" },
    { label: "pnpm -r build", cmd: "pnpm -r build" }
  ];

  if (hasScript("lint")) {
    commands.push({ label: "pnpm -r lint", cmd: "pnpm -r lint" });
  }

  if (hasHardhatTest()) {
    commands.push({
      label: "pnpm --filter ./apps/hardhat test",
      cmd: "pnpm --filter ./apps/hardhat test"
    });
  }

  for (const command of commands) {
    let ok = true;
    try {
      await runCmd(command.cmd);
    } catch {
      ok = false;
    }
    results.push({
      label: command.label,
      ok
    });
    if (!ok) {
      failed = true;
    }
  }

  prettyPrint(results);

  if (failed) {
    process.exitCode = 1;
  }

  console.log(`exitCode ${failed ? 1 : 0}`);
};

main();
