import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const mustExist = [
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

function exists(p) {
  return fs.existsSync(path.resolve(process.cwd(), p));
}

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { shell: true, stdio: "inherit" });

    child.on("error", (err) => {
      reject(new Error(`Failed to start command: ${cmd}\n${err.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed (${code}): ${cmd}`));
    });
  });
}

function hasScript(pkgJsonPath, scriptName) {
  try {
    const raw = fs.readFileSync(pkgJsonPath, "utf8");
    const json = JSON.parse(raw);
    return Boolean(json?.scripts?.[scriptName]);
  } catch {
    return false;
  }
}

async function main() {
  console.log("== Verify: files ==");
  let ok = true;

  for (const p of mustExist) {
    const present = exists(p);
    console.log(`${present ? "✅" : "❌"} ${p}`);
    if (!present) ok = false;
  }

  if (!ok) {
    process.exitCode = 1;
    return;
  }

  // detect if any workspace has lint
  const workspaces = [
    "package.json",
    "apps/web/package.json",
    "apps/api/package.json",
    "apps/hardhat/package.json",
    "packages/shared/package.json"
  ].filter(exists);

  const anyLint = workspaces.some((p) => hasScript(path.resolve(process.cwd(), p), "lint"));
  const hardhatHasTest = exists("apps/hardhat/package.json") &&
    hasScript(path.resolve(process.cwd(), "apps/hardhat/package.json"), "test");
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

  console.log("\n== Verify: commands ==");
  try {
    await runCmd("pnpm -r typecheck");
    await runCmd("pnpm -r build");
    if (anyLint) await runCmd("pnpm -r lint");
    if (hardhatHasTest) await runCmd("pnpm --filter ./apps/hardhat test");
    console.log("\n✅ Verify OK");
  } catch (e) {
    console.error("\n❌ Verify FAILED");
    console.error(e?.message || e);
    process.exitCode = 1;
  }
}

main();
