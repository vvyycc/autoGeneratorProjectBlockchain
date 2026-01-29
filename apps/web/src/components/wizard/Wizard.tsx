"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldPath } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import {
  ProjectConfigSchema,
  type ProjectConfig,
  demoProject
} from "@sale-factory/shared";

import {
  deleteProject,
  getProject,
  listProjects,
  saveProject
} from "../../lib/api";
import { clearDraft, loadDraft, saveDraft } from "../../lib/localDraft";
import StepInfo from "./steps/StepInfo";
import StepPreview from "./steps/StepPreview";
import StepRoadmap from "./steps/StepRoadmap";
import StepRounds from "./steps/StepRounds";
import StepTokenomics from "./steps/StepTokenomics";

const steps = [
  { id: "info", label: "Info", component: StepInfo },
  { id: "roadmap", label: "Roadmap", component: StepRoadmap },
  { id: "tokenomics", label: "Tokenomics", component: StepTokenomics },
  { id: "rounds", label: "Rounds", component: StepRounds },
  { id: "preview", label: "Preview", component: StepPreview }
] as const;

const stepFields: FieldPath<ProjectConfig>[][] = [
  [
    "name",
    "slug",
    "ticker",
    "chainTarget",
    "theme",
    "oneLiner",
    "description",
    "valueProp",
    "compliance.kycRequired",
    "compliance.geoRestrictions",
    "compliance.disclaimer"
  ],
  ["roadmap"],
  ["tokenomics.totalSupply", "tokenomics.decimals", "tokenomics.allocations"],
  ["rounds.preSales", "rounds.publicSales"],
  []
];

type ProjectSummary = {
  slug: string;
  name: string;
  updatedAt: string;
};

const Wizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChangeAt = useRef<number>(Date.now());
  const searchParams = useSearchParams();

  const form = useForm<ProjectConfig>({
    resolver: zodResolver(ProjectConfigSchema),
    defaultValues: demoProject,
    mode: "onBlur"
  });

  const buildZodErrorMessage = useCallback(
    (error: { issues: Array<{ path: Array<string | number>; message: string }> }) => {
      const lines = error.issues.map((issue) => {
        const path = issue.path.join(".") || "config";
        return `${path}: ${issue.message}`;
      });

      return `Validation errors:\n${lines.map((line) => `- ${line}`).join("\n")}`;
    },
    []
  );

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      form.reset(draft);
    }
  }, [form]);

  const refreshProjects = useCallback(async () => {
    setLoadingProjects(true);
    setApiError(null);

    try {
      const data = await listProjects();
      setProjects(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unable to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const loadProjectBySlug = useCallback(
    async (slug: string) => {
      if (!slug) {
        return;
      }

      setLoadingProjects(true);
      setApiError(null);

      try {
        const project = await getProject(slug);
        form.reset(project);
        setLastSavedAt(project.updatedAt ? new Date(project.updatedAt) : null);
        setActiveStep(0);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Unable to load project.");
      } finally {
        setLoadingProjects(false);
      }
    },
    [form]
  );

  useEffect(() => {
    const slug = searchParams.get("slug");
    if (slug && slug !== selectedSlug) {
      setSelectedSlug(slug);
      loadProjectBySlug(slug);
    }
  }, [loadProjectBySlug, searchParams, selectedSlug]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      lastChangeAt.current = Date.now();
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      saveTimeout.current = setTimeout(() => {
        saveDraft(value as ProjectConfig);
      }, 300);
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [form]);

  const handleSave = useCallback(
    async ({ silent }: { silent: boolean }) => {
      if (saving) {
        return;
      }

      setSaving(true);
      setApiError(null);

      const values = form.getValues();
      const validation = ProjectConfigSchema.safeParse(values);

      if (!validation.success) {
        const message = buildZodErrorMessage(validation.error);
        setApiError(message);
        setSaving(false);
        return;
      }

      try {
        const result = await saveProject(validation.data);
        form.reset(result.project);
        setLastSavedAt(new Date());

        if (!silent) {
          alert("Configuración guardada correctamente.");
        }

        await refreshProjects();
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Unable to save project.");
      } finally {
        setSaving(false);
      }
    },
    [buildZodErrorMessage, form, refreshProjects, saving]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (saving || !form.formState.isDirty) {
        return;
      }

      if (Date.now() - lastChangeAt.current < 1000) {
        return;
      }

      handleSave({ silent: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [form.formState.isDirty, handleSave, saving]);

  const StepComponent = useMemo(() => steps[activeStep].component, [activeStep]);

  const handleNext = async () => {
    const fields = stepFields[activeStep];
    const valid = fields.length ? await form.trigger(fields) : true;
    if (valid) {
      setActiveStep((step) => Math.min(step + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((step) => Math.max(step - 1, 0));
  };

  const handleResetDraft = () => {
    clearDraft();
    form.reset(demoProject);
  };

  const handleLoadProject = async () => {
    await loadProjectBySlug(selectedSlug);
  };

  const handleDeleteProject = async () => {
    if (!selectedSlug) {
      return;
    }

    const confirmed = confirm("¿Seguro que quieres borrar este proyecto?");
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setApiError(null);

    try {
      await deleteProject(selectedSlug);
      await refreshProjects();
      setSelectedSlug("");
      setLastSavedAt(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unable to delete project.");
    } finally {
      setSaving(false);
    }
  };

  const errorLines = apiError ? apiError.split("\n") : [];

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            Sale Factory Studio
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Wizard de configuración
          </h1>
          <p className="text-sm text-slate-300">
            Paso {activeStep + 1} de {steps.length}
          </p>
        </header>

        {apiError && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            <p className="font-semibold">Error</p>
            <ul className="mt-2 space-y-1">
              {errorLines.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[220px] flex-1 flex-col gap-1">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Load Project
              </label>
              <select
                value={selectedSlug}
                onChange={(event) => setSelectedSlug(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.slug} · {project.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleLoadProject}
              disabled={!selectedSlug || loadingProjects}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
            >
              {loadingProjects ? "Loading..." : "Load"}
            </button>
            <button
              type="button"
              onClick={() => handleSave({ silent: false })}
              disabled={saving}
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save Config"}
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              disabled={!selectedSlug || saving}
              className="rounded-lg border border-rose-500/60 px-4 py-2 text-sm text-rose-200 disabled:opacity-40"
            >
              Delete Project
            </button>
            {lastSavedAt && (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                Saved {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
            {(saving || loadingProjects) && (
              <span className="text-xs text-slate-400">⏳</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                index === activeStep
                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-100"
                  : "border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

        <StepComponent />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDraft}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            Reset draft
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 0}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default Wizard;
