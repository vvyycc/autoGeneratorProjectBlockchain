import { Router } from "express";
import { validateProjectConfig } from "@sale-factory/shared";

import {
  DataStoreError,
  deleteProject,
  listProjects,
  readProject,
  writeProject
} from "../storage/dataStore";

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

export default router;
