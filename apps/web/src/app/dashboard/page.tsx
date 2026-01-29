"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteProject, listProjects } from "../../lib/api";

type ProjectSummary = {
  slug: string;
  name: string;
  updatedAt: string;
};

const DashboardPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const handleDelete = async (slug: string) => {
    const confirmed = confirm("¿Seguro que quieres borrar este proyecto?");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteProject(slug);
      await refreshProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          Sale Factory Studio
        </p>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-300">
          Administra los proyectos guardados.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-slate-300">
          <span>Proyectos</span>
          {loading && <span>⏳</span>}
        </div>
        <div className="divide-y divide-slate-800">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-white">{project.name}</p>
                <p className="text-xs text-slate-400">
                  {project.slug} · Actualizado {new Date(project.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/?slug=${project.slug}`)}
                  className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project.slug)}
                  className="rounded-lg border border-rose-500/60 px-3 py-1 text-xs text-rose-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!loading && projects.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-400">
              No hay proyectos guardados todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
