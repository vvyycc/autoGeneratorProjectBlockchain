import fs from "node:fs";
import path from "node:path";

import type { ProjectConfig } from "@sale-factory/shared";

const DATA_ROOT = "/data";
const PROJECT_FILE = "project.json";

export class DataStoreError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const ensureDataRoot = () => {
  fs.mkdirSync(DATA_ROOT, { recursive: true });
};

export const ensureSlugSafe = (slug: string) => {
  if (typeof slug !== "string") {
    throw new DataStoreError("INVALID_SLUG", "Slug must be a string.");
  }

  const normalized = slug.trim().toLowerCase();

  if (!normalized || normalized.includes("..")) {
    throw new DataStoreError("INVALID_SLUG", "Slug is invalid.");
  }

  if (normalized.includes("/") || normalized.includes("\\")) {
    throw new DataStoreError("INVALID_SLUG", "Slug cannot contain path separators.");
  }

  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new DataStoreError("INVALID_SLUG", "Slug must be lowercase and dash-safe.");
  }

  return normalized;
};

const projectDir = (slug: string) => path.join(DATA_ROOT, slug);
const projectFilePath = (slug: string) => path.join(projectDir(slug), PROJECT_FILE);

export const listProjects = (): Array<{ slug: string; name: string; updatedAt: string }> => {
  ensureDataRoot();

  const entries = fs.readdirSync(DATA_ROOT, { withFileTypes: true });
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

    const filePath = projectFilePath(slug);

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
  const filePath = projectFilePath(safeSlug);

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

  fs.writeFileSync(projectFilePath(safeSlug), JSON.stringify(payload, null, 2), "utf8");
};

export const deleteProject = (slug: string): void => {
  const safeSlug = ensureSlugSafe(slug);
  fs.rmSync(projectDir(safeSlug), { recursive: true, force: true });
};
