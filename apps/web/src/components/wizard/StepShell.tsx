"use client";

import type { ReactNode } from "react";

type StepShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const StepShell = ({ title, description, children }: StepShellProps) => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description ? (
          <p className="text-sm text-slate-300">{description}</p>
        ) : null}
      </header>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
};

export default StepShell;
