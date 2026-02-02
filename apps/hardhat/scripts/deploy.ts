import { readFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

type ProjectRound = {
  id: string;
  kind: "PRESALE" | "PUBLIC";
  start: string;
  end: string;
  price: string | number;
  hardCap: string | number;
  minBuy: string | number;
  maxBuy: string | number;
  acceptedCurrency: "ETH" | "USDT" | "USDC";
  whitelistEnabled: boolean;
  vestingEnabled: boolean;
};

type ProjectConfig = {
  name: string;
  slug: string;
  ticker: string;
  tokenomics: {
    totalSupply: string;
    decimals: number;
    maxSupply?: string;
    burnFeeBps?: number;
  };
  rounds: {
    preSales: ProjectRound[];
    publicSales: ProjectRound[];
  };
};

const getSlug = () => {
  const slugFlagIndex = process.argv.findIndex((arg) => arg === "--slug");
  if (slugFlagIndex !== -1 && process.argv[slugFlagIndex + 1]) {
    return process.argv[slugFlagIndex + 1];
  }
  return process.env.PROJECT_SLUG || process.env.SLUG || "";
};

const toNumericString = (value: string | number) =>
  typeof value === "number" ? value.toString() : value;

const parseTimestamp = (value: string) => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid date: ${value}`);
  }
  return Math.floor(parsed / 1000);
};

const main = async () => {
  const slug = getSlug();
  if (!slug) {
    throw new Error("Missing slug. Use --slug <project> or set PROJECT_SLUG.");
  }

  const projectPath = path.join("/data", slug, "project.json");
  const raw = readFileSync(projectPath, "utf-8");
  const project = JSON.parse(raw) as ProjectConfig;

  const decimals = project.tokenomics.decimals ?? 18;
  if (decimals !== 18) {
    console.warn(
      `Warning: token decimals are ${decimals}. SaleManager assumes 18 decimals for pricing.`
    );
  }

  const parseTokenAmount = (value: string | number) =>
    ethers.parseUnits(toNumericString(value), decimals);

  const initialSupply = parseTokenAmount(project.tokenomics.totalSupply);
  const maxSupply = project.tokenomics.maxSupply
    ? parseTokenAmount(project.tokenomics.maxSupply)
    : 0n;
  const burnFeeBps = project.tokenomics.burnFeeBps ?? 0;

  const TokenFactory = await ethers.getContractFactory("Token");
  const token = await TokenFactory.deploy(
    project.name,
    project.ticker,
    initialSupply,
    maxSupply,
    burnFeeBps
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const SaleManagerFactory = await ethers.getContractFactory("SaleManager");
  const saleManager = await SaleManagerFactory.deploy(tokenAddress);
  await saleManager.waitForDeployment();
  const saleManagerAddress = await saleManager.getAddress();

  const rounds = [...project.rounds.preSales, ...project.rounds.publicSales];
  const totalHardCap = rounds.reduce((total, round) => {
    return total + parseTokenAmount(round.hardCap);
  }, 0n);

  if (totalHardCap > 0n) {
    const transferTx = await token.transfer(saleManagerAddress, totalHardCap);
    await transferTx.wait();
  }

  for (const round of rounds) {
    if (round.acceptedCurrency !== "ETH") {
      console.warn(
        `Warning: round ${round.id} acceptedCurrency is ${round.acceptedCurrency}. buyETH only uses ETH.`
      );
    }

    const roundId = ethers.id(round.id);
    const params = {
      kind: round.kind === "PRESALE" ? 0 : 1,
      start: parseTimestamp(round.start),
      end: parseTimestamp(round.end),
      priceWeiPerToken: ethers.parseUnits(toNumericString(round.price), 18),
      hardCapTokens: parseTokenAmount(round.hardCap),
      minBuyTokens: parseTokenAmount(round.minBuy),
      maxBuyTokens: parseTokenAmount(round.maxBuy),
      soldTokens: 0,
      whitelistEnabled: round.whitelistEnabled,
      vestingEnabled: round.vestingEnabled
    };

    const tx = await saleManager.createRound(roundId, params);
    await tx.wait();
  }

  console.log("Token deployed to:", tokenAddress);
  console.log("SaleManager deployed to:", saleManagerAddress);
  console.log("Rounds configured:", rounds.length);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
