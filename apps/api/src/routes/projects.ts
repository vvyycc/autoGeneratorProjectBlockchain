import fs from "node:fs";
import { Router } from "express";
import { validateProjectConfig } from "@sale-factory/shared";

import {
  DataStoreError,
  deleteProject,
  listProjects,
  readProject,
  writeProject,
  ensureSlugSafe
} from "../storage/dataStore";
import { deploymentsPath, projectJsonPath } from "../utils/paths";
import { runHardhatDeploy } from "../services/hardhatRunner";

const router = Router();

const sendError = (
  res: { status: (code: number) => { json: (payload: unknown) => void } },
  status: number,
  code: string,
  message: string,
  details?: unknown
) => {
  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  });
};

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.get("/projects", (_req, res) => {
  try {
    const projects = listProjects();
    res.json(projects);
  } catch (error) {
    sendError(res, 500, "LIST_FAILED", "Unable to list projects.", error);
  }
});

router.get("/projects/:slug", (req, res) => {
  try {
    const project = readProject(req.params.slug);
    res.json(project);
  } catch (error) {
    if (error instanceof DataStoreError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      sendError(res, status, error.code, error.message);
      return;
    }

    sendError(res, 500, "READ_FAILED", "Unable to read project.", error);
  }
});

router.post("/projects", (req, res) => {
  try {
    const now = new Date().toISOString();
    const draft = { ...(req.body as Record<string, unknown>) };

    if (!draft.createdAt) {
      draft.createdAt = now;
    }

    draft.updatedAt = now;

    const validation = validateProjectConfig(draft);

    if (!validation.ok) {
      sendError(res, 400, "VALIDATION_ERROR", "Project config is invalid.", validation.error);
      return;
    }

    const project = validation.data;
    writeProject(project);

    res.json({ ok: true, project });
  } catch (error) {
    if (error instanceof DataStoreError) {
      sendError(res, 400, error.code, error.message);
      return;
    }

    sendError(res, 500, "WRITE_FAILED", "Unable to write project.", error);
  }
});

router.delete("/projects/:slug", (req, res) => {
  try {
    deleteProject(req.params.slug);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof DataStoreError) {
      sendError(res, 400, error.code, error.message);
      return;
    }

    sendError(res, 500, "DELETE_FAILED", "Unable to delete project.", error);
  }
});

router.post("/projects/:slug/deploy", async (req, res) => {
  try {
    const safeSlug = ensureSlugSafe(req.params.slug);
    const projectPath = projectJsonPath(safeSlug);

    if (!fs.existsSync(projectPath)) {
      sendError(res, 404, "NOT_FOUND", `Project ${safeSlug} not found.`);
      return;
    }

    const network = (req.body as { network?: string })?.network?.trim();

    if (!network) {
      sendError(res, 400, "INVALID_NETWORK", "Network is required.");
      return;
    }

    await runHardhatDeploy({ slug: safeSlug, network });

    const deploymentsFile = deploymentsPath(safeSlug);

    if (!fs.existsSync(deploymentsFile)) {
      sendError(res, 500, "DEPLOYMENTS_MISSING", "Deployments file not found after deploy.");
      return;
    }

    const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8")) as unknown;

    res.json({ ok: true, deployments });
  } catch (error) {
    if (error instanceof DataStoreError) {
      sendError(res, 400, error.code, error.message);
      return;
    }

    sendError(
      res,
      500,
      "DEPLOY_FAILED",
      "Unable to deploy project.",
      error instanceof Error ? error.message : error
    );
  }
});

router.get("/projects/:slug/deployments", (req, res) => {
  try {
    const safeSlug = ensureSlugSafe(req.params.slug);
    const deploymentsFile = deploymentsPath(safeSlug);

    if (!fs.existsSync(deploymentsFile)) {
      sendError(res, 404, "NOT_FOUND", `Deployments for ${safeSlug} not found.`);
      return;
    }

    const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8")) as unknown;

    res.json({ ok: true, deployments });
  } catch (error) {
    if (error instanceof DataStoreError) {
      sendError(res, 400, error.code, error.message);
      return;
    }

    sendError(res, 500, "READ_FAILED", "Unable to read deployments.", error);
  }
});

router.get("/projects/:slug/status", (req, res) => {
  try {
    const safeSlug = ensureSlugSafe(req.params.slug);
    const projectPath = projectJsonPath(safeSlug);

    if (!fs.existsSync(projectPath)) {
      sendError(res, 404, "NOT_FOUND", `Project ${safeSlug} not found.`);
      return;
    }

    const project = JSON.parse(fs.readFileSync(projectPath, "utf8")) as unknown;
    const deploymentsFile = deploymentsPath(safeSlug);

    if (fs.existsSync(deploymentsFile)) {
      const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8")) as unknown;
      res.json({ ok: true, project, deployments });
      return;
    }

    res.json({ ok: true, project });
  } catch (error) {
    if (error instanceof DataStoreError) {
      sendError(res, 400, error.code, error.message);
      return;
    }

    sendError(res, 500, "STATUS_FAILED", "Unable to read project status.", error);
  }
});

export default router;
