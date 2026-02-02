import fs from "node:fs";

import type { ProjectConfig } from "@sale-factory/shared";

import { dataDir, isSafeSlug, projectJsonPath, projectDir } from "../utils/paths";

export class DataStoreError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const ensureDataRoot = () => {
  fs.mkdirSync(dataDir(), { recursive: true });
};

export const ensureSlugSafe = (slug: string) => {
  if (typeof slug !== "string") {
    throw new DataStoreError("INVALID_SLUG", "Slug must be a string.");
  }

  const normalized = slug.trim().toLowerCase();

  if (!normalized || normalized.includes("..")) {
    throw new DataStoreError("INVALID_SLUG", "Slug is invalid.");
  }

  if (!isSafeSlug(normalized)) {
    throw new DataStoreError("INVALID_SLUG", "Slug must be lowercase and dash-safe.");
  }

  return normalized;
};

export const listProjects = (): Array<{ slug: string; name: string; updatedAt: string }> => {
  ensureDataRoot();

  const entries = fs.readdirSync(dataDir(), { withFileTypes: true });
  const projects: Array<{ slug: string; name: string; updatedAt: string }> = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const slug = entry.name;

    try {
      ensureSlugSafe(slug);
    } catch {
      continue;
    }

    const filePath = projectJsonPath(slug);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as ProjectConfig;

      if (parsed?.name && parsed?.updatedAt) {
        projects.push({
          slug,
          name: parsed.name,
          updatedAt: parsed.updatedAt
        });
      }
    } catch {
      continue;
    }
  }

  return projects;
};

export const readProject = (slug: string): ProjectConfig => {
  const safeSlug = ensureSlugSafe(slug);
  const filePath = projectJsonPath(safeSlug);

  if (!fs.existsSync(filePath)) {
    throw new DataStoreError("NOT_FOUND", `Project ${safeSlug} not found.`);
  }

  const raw = fs.readFileSync(filePath, "utf8");

  return JSON.parse(raw) as ProjectConfig;
};

export const writeProject = (config: ProjectConfig): void => {
  const safeSlug = ensureSlugSafe(config.slug);
  ensureDataRoot();

  const dir = projectDir(safeSlug);
  fs.mkdirSync(dir, { recursive: true });

  const updatedAt = new Date().toISOString();
  config.updatedAt = updatedAt;

  const payload: ProjectConfig = {
    ...config,
    slug: safeSlug,
    updatedAt
  };

  fs.writeFileSync(projectJsonPath(safeSlug), JSON.stringify(payload, null, 2), "utf8");
};

export const deleteProject = (slug: string): void => {
  const safeSlug = ensureSlugSafe(slug);
  fs.rmSync(projectDir(safeSlug), { recursive: true, force: true });
};
