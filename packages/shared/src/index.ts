import { z } from "zod";

export const statusSchema = z.object({
  status: z.enum(["ok", "error"]),
  message: z.string()
});

export type StatusResponse = z.infer<typeof statusSchema>;

export const sharedGreeting = (team: string) =>
  `Hola ${team}, el monorepo está listo para construir.`;

export * from "./demoProject";
export * from "./schema";
export * from "./types";
