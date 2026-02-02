import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { ethers, hre } from "hardhat";

dotenv.config();

type ProjectRound = {
  id: string;
  name?: string;
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

  const projectPath = path.resolve(
    process.cwd(),
    "..",
    "..",
    "data",
    slug,
    "project.json"
  );
  console.log("Project config path:", projectPath);
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

  const totalSupplyFromConfig = parseTokenAmount(
    project.tokenomics.totalSupply
  );
  const initialSupply = 0n;
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
  const totalHardCapTokens = rounds.reduce((total, round) => {
    return total + parseTokenAmount(round.hardCap);
  }, 0n);

  if (totalHardCapTokens > totalSupplyFromConfig) {
    throw new Error(
      `Total hard cap tokens (${totalHardCapTokens}) exceed total supply from config (${totalSupplyFromConfig}).`
    );
  }
  if (maxSupply > 0n && totalHardCapTokens > maxSupply) {
    throw new Error(
      `Total hard cap tokens (${totalHardCapTokens}) exceed max supply (${maxSupply}).`
    );
  }

  if (totalHardCapTokens > 0n) {
    const mintTx = await token.mint(saleManagerAddress, totalHardCapTokens);
    await mintTx.wait();
  }

  const deploymentsRounds = [];
  for (const round of rounds) {
    if (round.acceptedCurrency !== "ETH") {
      console.warn(
        `Warning: round ${round.id} acceptedCurrency is ${round.acceptedCurrency}. buyETH only uses ETH.`
      );
    }

    const roundId = ethers.keccak256(
      ethers.toUtf8Bytes(`${project.slug}:${round.kind}:${round.id}`)
    );
    const priceEthPerToken = ethers.parseEther(
      toNumericString(round.price)
    );
    const params = {
      kind: round.kind === "PRESALE" ? 0 : 1,
      start: parseTimestamp(round.start),
      end: parseTimestamp(round.end),
      priceWeiPerToken: priceEthPerToken,
      hardCapTokens: parseTokenAmount(round.hardCap),
      minBuyTokens: parseTokenAmount(round.minBuy),
      maxBuyTokens: parseTokenAmount(round.maxBuy),
      soldTokens: 0,
      whitelistEnabled: round.whitelistEnabled,
      vestingEnabled: round.vestingEnabled
    };

    const tx = await saleManager.createRound(roundId, params);
    await tx.wait();

    deploymentsRounds.push({
      roundId,
      kind: round.kind,
      name: round.name ?? round.id,
      start: round.start,
      end: round.end,
      hardCapTokens: params.hardCapTokens.toString(),
      priceWeiPerToken: priceEthPerToken.toString(),
      whitelistEnabled: round.whitelistEnabled,
      vestingEnabled: round.vestingEnabled
    });
  }

  const network = await ethers.provider.getNetwork();
  const deploymentsPath = path.resolve(
    process.cwd(),
    "..",
    "..",
    "data",
    slug,
    "deployments.json"
  );
  mkdirSync(path.dirname(deploymentsPath), { recursive: true });
  const deploymentsPayload = {
    slug,
    network: hre.network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    token: {
      address: tokenAddress,
      name: project.name,
      symbol: project.ticker,
      decimals
    },
    saleManager: {
      address: saleManagerAddress
    },
    rounds: deploymentsRounds
  };
  writeFileSync(deploymentsPath, JSON.stringify(deploymentsPayload, null, 2));

  console.log("Deployments path:", deploymentsPath);
  console.log("Token deployed to:", tokenAddress);
  console.log("SaleManager deployed to:", saleManagerAddress);
  console.log("Rounds configured:", rounds.length);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
