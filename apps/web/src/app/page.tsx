import { sharedGreeting } from "@sale-factory/shared";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <section className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          Sale Factory Studio
        </p>
        <h1 className="text-4xl font-semibold">Panel inicial</h1>
        <p className="text-slate-300">
          {sharedGreeting("equipo")}
        </p>
      </section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 className="text-lg font-medium">Servicios listos</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
          <li>Next.js + Tailwind para la interfaz web.</li>
          <li>API Express con TypeScript.</li>
          <li>Hardhat para el desarrollo smart contracts.</li>
        </ul>
      </section>
    </main>
  );
}
