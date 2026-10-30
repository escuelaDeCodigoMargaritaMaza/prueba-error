import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import owl from "@/assets/dra-lechuza.png";
import { ContingencyTable } from "@/components/site/ContingencyTable";
import { Guide } from "@/components/site/Guide";
import { ParamControls } from "@/components/site/ParamControls";
import { PatientGrid } from "@/components/site/PatientGrid";
import { Button } from "@/components/ui/button";
import { CONCEPTS } from "@/lib/concepts";
import { fmtNum, fmtPct } from "@/lib/diagnostic";
import { labMessages } from "@/lib/guide-messages";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prueba & Error — Laboratorio de pruebas diagnósticas" },
      {
        name: "description",
        content:
          "Elige pacientes, verdaderos y falsos positivos y aprende sensibilidad, especificidad, VPP, VPN, LR, ROC y Bayes.",
      },
      { property: "og:title", content: "Prueba & Error — Laboratorio de pruebas diagnósticas" },
      {
        property: "og:description",
        content: "Un laboratorio interactivo para entender la estadística de las pruebas diagnósticas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { counts, m, reset } = useStudy();
  const messages = labMessages(counts, m);
  const [tip, setTip] = useState(0);
  const message = messages[tip % messages.length];

  const results = [
    { label: "Sensibilidad", value: fmtPct(m.sens), to: "/sensibilidad-especificidad" as const },
    { label: "Especificidad", value: fmtPct(m.spec), to: "/sensibilidad-especificidad" as const },
    { label: "VPP", value: fmtPct(m.ppv), to: "/valores-predictivos" as const },
    { label: "VPN", value: fmtPct(m.npv), to: "/valores-predictivos" as const },
    { label: "LR+", value: fmtNum(m.lrPos), to: "/razones-de-verosimilitud" as const },
    { label: "LR−", value: fmtNum(m.lrNeg), to: "/razones-de-verosimilitud" as const },
  ];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-12 md:grid-cols-[1.3fr_1fr] md:pt-20">
        <div>
          <p className="eyebrow">Estadística para estudiantes</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.02] md:text-7xl">
            Aprende de pruebas con <span className="marker italic">pacientes</span> que puedes contar.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Sensibilidad, especificidad, VPP, VPN, razones de verosimilitud, curvas ROC, Bayes y nomogramas.
            ¡Juega con los números y ve los cambios!
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <a href="#laboratorio">
                Abrir el laboratorio <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/sensibilidad-especificidad">Empezar por lo básico</Link>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-6 rounded-full bg-ochre-soft" />
          <img src={owl} alt="Dr. Roc, la guía del sitio" width={1024} height={1024} className="owl-bob relative" />
        </div>
      </section>

      <section id="laboratorio" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">El laboratorio</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Diseña tu estudio</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Usa los controles o escribe directamente los verdaderos y falsos positivos y negativos. Este estudio te
              acompaña por todas las secciones.
            </p>
          </div>
          <Button variant="ghost" onClick={reset}>
            <RotateCcw /> Restablecer
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="space-y-6">
            <div className="card-paper p-6">
              <p className="eyebrow mb-4">1 · Escoge los parámetros...</p>
              <ParamControls />
            </div>
            <div className="card-paper p-6">
              <p className="eyebrow mb-4">2 · ¡o edita la tabla 2×2!</p>
              <ContingencyTable />
            </div>
          </div>
          <div className="space-y-6">
            <div className="card-paper p-6">
              <p className="eyebrow mb-4">3 · Tus pacientes</p>
              <PatientGrid counts={counts} />
            </div>
            <Guide>
              <p>{message}</p>
              {messages.length > 1 && (
                <button onClick={() => setTip((t) => t + 1)} className="text-sm font-semibold text-primary hover:underline">
                  Otra observación →
                </button>
              )}
            </Guide>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
          {results.map((r) => (
            <Link key={r.label} to={r.to} className="card-paper group p-4 transition-transform hover:-translate-y-0.5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.label}</p>
              <p className="num mt-1 text-2xl font-semibold">{r.value}</p>
              <p className="mt-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                ¿Qué significa? →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Temas a revisar</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">¿Qué tanto podemos saber de una prueba?</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CONCEPTS.slice(1).map((c, i) => (
            <Link key={c.to} to={c.to} className="card-paper group flex flex-col p-6 transition-transform hover:-translate-y-1">
              <span className="num text-sm text-ochre">0{i + 1}</span>
              <span className="mt-2 font-display text-xl font-semibold">{c.label}</span>
              <span className="mt-2 flex-1 text-sm text-muted-foreground">{c.blurb}</span>
              <ArrowRight className="mt-4 size-5 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
