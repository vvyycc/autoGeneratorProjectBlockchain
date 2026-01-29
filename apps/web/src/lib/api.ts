import type { ProjectConfig } from "@sale-factory/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type ApiErrorPayload = {
  ok: false;
  error: {
    message?: string;
  };
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T | ApiErrorPayload;

  if (
    data &&
    typeof data === "object" &&
    "ok" in data &&
    data.ok === false
  ) {
    throw new Error(data.error?.message || "Request failed");
  }

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return data as T;
};

export async function listProjects() {
  const response = await fetch(`${API_BASE}/projects`, {
    headers: {
      Accept: "application/json"
    }
  });

  return parseJson<Array<{ slug: string; name: string; updatedAt: string }>>(
    response
  );
}

export async function getProject(slug: string) {
  const response = await fetch(`${API_BASE}/projects/${slug}`, {
    headers: {
      Accept: "application/json"
    }
  });

  return parseJson<ProjectConfig>(response);
}

export async function saveProject(config: ProjectConfig) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(config)
  });

  return parseJson<{ ok: true; project: ProjectConfig }>(response);
}

export async function deleteProject(slug: string) {
  const response = await fetch(`${API_BASE}/projects/${slug}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json"
    }
  });

  return parseJson<{ ok: true }>(response);
}
