import { z } from "zod";

const percentSchema = z.number().min(0).max(100);
const numericValueSchema = z.union([z.string(), z.number()]);

const slugSchema = z
  .string()
  .transform((value) => value.toLowerCase())
  .refine((value) => /^[a-z0-9-]+$/.test(value), {
    message: "Slug must be lowercase and contain no spaces."
  });

const tickerSchema = z.string().transform((value) => value.toUpperCase());

const parseNumeric = (value: string | number) =>
  typeof value === "number" ? value : Number(value);

export const RoadmapItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  dateLabel: z.string(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "DONE"])
});

export const AllocationSchema = z.object({
  name: z.string(),
  percent: percentSchema,
  vesting: z.string().optional(),
  cliff: z.string().optional(),
  notes: z.string().optional()
});

export const RoundSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    kind: z.enum(["PRESALE", "PUBLIC"]),
    start: z.string(),
    end: z.string(),
    price: numericValueSchema,
    hardCap: numericValueSchema,
    minBuy: numericValueSchema,
    maxBuy: numericValueSchema,
    acceptedCurrency: z.enum(["ETH", "USDT", "USDC"]),
    whitelistEnabled: z.boolean(),
    vestingEnabled: z.boolean()
  })
  .superRefine((round, ctx) => {
    const startTime = Date.parse(round.start);
    const endTime = Date.parse(round.end);

    if (!Number.isNaN(startTime) && !Number.isNaN(endTime) && startTime >= endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Round start must be before end.",
        path: ["start"]
      });
    }

    const hardCap = parseNumeric(round.hardCap);
    const minBuy = parseNumeric(round.minBuy);
    const maxBuy = parseNumeric(round.maxBuy);

    if (Number.isFinite(hardCap) && Number.isFinite(minBuy) && hardCap < minBuy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "hardCap must be greater than or equal to minBuy.",
        path: ["hardCap"]
      });
    }

    if (Number.isFinite(maxBuy) && Number.isFinite(minBuy) && maxBuy < minBuy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "maxBuy must be greater than or equal to minBuy.",
        path: ["maxBuy"]
      });
    }
  });

export const TokenomicsSchema = z
  .object({
    totalSupply: z.string(),
    decimals: z.number(),
    maxSupply: z.string().optional(),
    burnFeeBps: z.number().optional(),
    allocations: z.array(AllocationSchema)
  })
  .superRefine((tokenomics, ctx) => {
    const totalSupply = Number(tokenomics.totalSupply);

    if (!Number.isFinite(totalSupply) || totalSupply <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "totalSupply must be greater than 0.",
        path: ["totalSupply"]
      });
    }

    const allocationSum = tokenomics.allocations.reduce(
      (total, allocation) => total + allocation.percent,
      0
    );

    if (allocationSum > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "allocations percent sum must be less than or equal to 100.",
        path: ["allocations"]
      });
    }
  });

export const ProjectConfigSchema = z.object({
  name: z.string(),
  slug: slugSchema,
  ticker: tickerSchema,
  chainTarget: z.string(),
  theme: z.string(),
  oneLiner: z.string(),
  description: z.string(),
  valueProp: z.string().optional(),
  roadmap: z.array(RoadmapItemSchema),
  tokenomics: TokenomicsSchema,
  rounds: z.object({
    preSales: z.array(RoundSchema),
    publicSales: z.array(RoundSchema)
  }),
  compliance: z.object({
    kycRequired: z.boolean(),
    geoRestrictions: z.array(z.string()),
    disclaimer: z.string()
  }),
  links: z.object({
    website: z.string().optional(),
    whitepaper: z.string().optional(),
    docs: z.string().optional(),
    twitter: z.string().optional(),
    telegram: z.string().optional(),
    discord: z.string().optional()
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const validateProjectConfig = (config: unknown) => {
  const result = ProjectConfigSchema.safeParse(config);

  if (!result.success) {
    return {
      ok: false,
      error: result.error
    };
  }

  return {
    ok: true,
    data: result.data
  };
};
