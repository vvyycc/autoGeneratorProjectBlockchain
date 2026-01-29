import type { ProjectConfig } from "./types";

export const demoProject: ProjectConfig = {
  name: "Atlas Chain",
  slug: "atlas-chain",
  ticker: "atlas",
  chainTarget: "Ethereum",
  theme: "midnight",
  oneLiner: "Infraestructura modular para activos tokenizados.",
  description:
    "Atlas Chain ofrece un stack para emitir y operar activos digitales con cumplimiento regulatorio y liquidez programable.",
  valueProp:
    "Tokenización rápida con compliance integrado, analítica en tiempo real y acceso a mercados globales.",
  roadmap: [
    {
      title: "Diseño del protocolo",
      description: "Definición de los módulos core y arquitectura de seguridad.",
      dateLabel: "Q1 2024",
      status: "DONE"
    },
    {
      title: "Testnet privada",
      description: "Lanzamiento con validadores estratégicos y métricas de rendimiento.",
      dateLabel: "Q2 2024",
      status: "IN_PROGRESS"
    },
    {
      title: "Auditoría externa",
      description: "Revisión de contratos y hardening del stack.",
      dateLabel: "Q3 2024",
      status: "PLANNED"
    },
    {
      title: "Mainnet + listing",
      description: "Despliegue público y acuerdos con partners de liquidez.",
      dateLabel: "Q4 2024",
      status: "PLANNED"
    }
  ],
  tokenomics: {
    totalSupply: "1000000000",
    decimals: 18,
    maxSupply: "1200000000",
    burnFeeBps: 25,
    allocations: [
      {
        name: "Comunidad",
        percent: 45,
        vesting: "24 meses",
        cliff: "3 meses",
        notes: "Programas de liquidez y staking."
      },
      {
        name: "Equipo",
        percent: 20,
        vesting: "36 meses",
        cliff: "12 meses"
      },
      {
        name: "Tesorería",
        percent: 15
      },
      {
        name: "Ecosistema",
        percent: 10
      }
    ]
  },
  rounds: {
    preSales: [
      {
        id: "8a0a9b2b-1111-4f3b-9d6a-0b2af4fbe001",
        name: "Seed",
        kind: "PRESALE",
        start: "2024-05-01T00:00:00.000Z",
        end: "2024-05-20T00:00:00.000Z",
        price: "0.015",
        hardCap: "1500000",
        minBuy: "250",
        maxBuy: "25000",
        acceptedCurrency: "USDT",
        whitelistEnabled: true,
        vestingEnabled: true
      },
      {
        id: "8a0a9b2b-2222-4f3b-9d6a-0b2af4fbe002",
        name: "Strategic",
        kind: "PRESALE",
        start: "2024-06-01T00:00:00.000Z",
        end: "2024-06-20T00:00:00.000Z",
        price: "0.022",
        hardCap: "2500000",
        minBuy: "500",
        maxBuy: "50000",
        acceptedCurrency: "USDC",
        whitelistEnabled: true,
        vestingEnabled: true
      }
    ],
    publicSales: [
      {
        id: "8a0a9b2b-3333-4f3b-9d6a-0b2af4fbe003",
        name: "Public Round",
        kind: "PUBLIC",
        start: "2024-07-10T00:00:00.000Z",
        end: "2024-07-25T00:00:00.000Z",
        price: "0.03",
        hardCap: "6000000",
        minBuy: "100",
        maxBuy: "10000",
        acceptedCurrency: "ETH",
        whitelistEnabled: false,
        vestingEnabled: false
      }
    ]
  },
  compliance: {
    kycRequired: true,
    geoRestrictions: ["US", "CN"],
    disclaimer: "La compra de tokens está sujeta a verificaciones KYC y restricciones locales."
  },
  links: {
    website: "https://atlaschain.example",
    whitepaper: "https://atlaschain.example/whitepaper.pdf",
    docs: "https://docs.atlaschain.example",
    twitter: "https://twitter.com/atlaschain",
    telegram: "https://t.me/atlaschain",
    discord: "https://discord.gg/atlaschain"
  },
  createdAt: "2024-04-15T12:00:00.000Z",
  updatedAt: "2024-05-05T12:00:00.000Z"
};
