import type { z } from "zod";

import type {
  AllocationSchema,
  ProjectConfigSchema,
  RoadmapItemSchema,
  RoundSchema,
  TokenomicsSchema
} from "./schema";

export type RoadmapItem = z.infer<typeof RoadmapItemSchema>;
export type Allocation = z.infer<typeof AllocationSchema>;
export type Round = z.infer<typeof RoundSchema>;
export type Tokenomics = z.infer<typeof TokenomicsSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
