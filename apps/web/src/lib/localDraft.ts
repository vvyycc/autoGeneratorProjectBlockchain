import type { ProjectConfig } from "@sale-factory/shared";

const STORAGE_KEY = "sale-factory.project-draft";

export const loadDraft = (): ProjectConfig | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ProjectConfig;
  } catch (error) {
    console.warn("Unable to parse project draft", error);
    return null;
  }
};

export const saveDraft = (draft: ProjectConfig) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const clearDraft = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
