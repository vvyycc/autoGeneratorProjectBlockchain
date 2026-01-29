"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldPath } from "react-hook-form";
import {
  ProjectConfigSchema,
  type ProjectConfig,
  demoProject
} from "@sale-factory/shared";

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

const Wizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<ProjectConfig>({
    resolver: zodResolver(ProjectConfigSchema),
    defaultValues: demoProject,
    mode: "onBlur"
  });

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      form.reset(draft);
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
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
