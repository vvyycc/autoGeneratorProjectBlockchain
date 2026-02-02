import path from "node:path";

export const repoRoot = (): string => path.resolve(process.cwd(), "..", "..");

export const dataDir = (): string => path.join(repoRoot(), "data");

export const projectDir = (slug: string): string => path.join(dataDir(), slug);

export const projectJsonPath = (slug: string): string => path.join(projectDir(slug), "project.json");

export const deploymentsPath = (slug: string): string =>
  path.join(projectDir(slug), "deployments.json");

export const isSafeSlug = (slug: string): boolean => {
  if (typeof slug !== "string") {
    return false;
  }

  if (!slug || slug.includes("..")) {
    return false;
  }

  if (slug.includes("/") || slug.includes("\\")) {
    return false;
  }

  return /^[a-z0-9-]+$/.test(slug);
};
