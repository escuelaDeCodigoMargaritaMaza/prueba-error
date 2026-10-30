import { createFileRoute } from "@tanstack/react-router";
import { ContingencyTable } from "@/components/site/ContingencyTable";
import { FormulaCard, Fraction } from "@/components/site/Formula";
import { Guide } from "@/components/site/Guide";
import { ConceptPager, PageHero, Section } from "@/components/site/PageParts";
import { ParamControls } from "@/components/site/ParamControls";
import { PatientGrid } from "@/components/site/PatientGrid";
import { Quiz } from "@/components/site/Quiz";
import { fmtPct, npvAt, ppvAt } from "@/lib/diagnostic";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/valores-predictivos")({
  head: () => ({
    meta: [
      { title: "Valor predictivo positivo y negativo (VPP y VPN) — Prueba & Error" },
      {
        name: "description",
        content: "Entiende el VPP y el VPN, y por qué dependen de la prevalencia, con una gráfica interactiva.",
      },
      { property: "og:title", content: "VPP y VPN: lo que el paciente quiere saber" },
      { property: "og:description", content: "Mira cómo la prevalencia cambia el valor predictivo de una prueba." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PredictivePage,
});

const W = 560;
const H = 300;
const PAD = { l: 44, r: 16, t: 16, b: 40 };

function PrevalenceChart({ sens, spec, prev }: { sens: number; spec: number; prev: number }) {
  const x = (p: number) => PAD.l + p * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);
  const pts = Array.from({ length: 101 }, (_, i) => i / 100);
  const path = (f: (p: number) => number) =>
    pts
      .map((p, i) => {
        const v = f(p);
        return `${i === 0 ? "M" : "L"}${x(p).toFixed(1)},${y(Number.isNaN(v) ? 0 : v).toFixed(1)}`;
      })
      .join(" ");
  const ppv = ppvAt(prev, sens, spec);
  const npv = npvAt(prev, sens, spec);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="VPP y VPN según la prevalencia">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" />
          <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
            {t * 100}%
          </text>
          <text x={x(t)} y={H - PAD.b + 18} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
            {t * 100}%
          </text>
        </g>
      ))}
      <text x={(W + PAD.l) / 2} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[11px]">
        Prevalencia
      </text>
      <path d={path((p) => ppvAt(p, sens, spec))} className="fill-none stroke-vp" strokeWidth={3} />
      <path d={path((p) => npvAt(p, sens, spec))} className="fill-none stroke-vn" strokeWidth={3} />
      <line x1={x(prev)} x2={x(prev)} y1={PAD.t} y2={H - PAD.b} className="stroke-foreground" strokeWidth={1.5} />
      {!Number.isNaN(ppv) && <circle cx={x(prev)} cy={y(ppv)} r={6} className="fill-vp stroke-card" strokeWidth={2} />}
      {!Number.isNaN(npv) && <circle cx={x(prev)} cy={y(npv)} r={6} className="fill-vn stroke-card" strokeWidth={2} />}
    </svg>
  );
}

function PredictivePage() {
  const { counts, m } = useStudy();
  const sens = Number.isNaN(m.sens) ? 0 : m.sens;
  const spec = Number.isNaN(m.spec) ? 0 : m.spec;
  const prev = Number.isNaN(m.prevalence) ? 0 : m.prevalence;

  return (
    <>
      <PageHero eyebrow="Tema 02" title="Valores predictivos: VPP y VPN">
        El paciente no pregunta “¿qué tan sensible es la prueba?”. Pregunta: “Doctor, salí positivo… ¿estoy
        enfermo?”. Eso lo responden los valores predictivos.
      </PageHero>

      <Section>
        <Guide>
          <p>
            Ahora leemos <strong>por filas</strong>: entre todos los positivos, ¿cuántos están realmente enfermos? Y
            como cada fila mezcla enfermos y sanos, <span className="marker">la prevalencia lo cambia todo</span>.
          </p>
        </Guide>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormulaCard
            name="Valor predictivo positivo (VPP)"
            accent="border-vp"
            result={fmtPct(m.ppv)}
            symbolic={<Fraction num="VP" den="VP + FP" />}
            numeric={<Fraction num={counts.tp} den={`${counts.tp} + ${counts.fp}`} />}
          >
            Si sales positivo, tienes un <strong className="text-foreground">{fmtPct(m.ppv, 0)}</strong> de probabilidad
            de estar enfermo.
          </FormulaCard>
          <FormulaCard
            name="Valor predictivo negativo (VPN)"
            accent="border-vn"
            result={fmtPct(m.npv)}
            symbolic={<Fraction num="VN" den="VN + FN" />}
            numeric={<Fraction num={counts.tn} den={`${counts.tn} + ${counts.fn}`} />}
          >
            Si sales negativo, tienes un <strong className="text-foreground">{fmtPct(m.npv, 0)}</strong> de probabilidad
            de estar sano.
          </FormulaCard>
        </div>
      </Section>

      <Section title="El efecto de la prevalencia" kicker="Experimento">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="card-paper p-6">
            <div className="mb-2 flex gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-1 w-5 rounded bg-vp" /> VPP
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-5 rounded bg-vn" /> VPN
              </span>
            </div>
            <PrevalenceChart sens={sens} spec={spec} prev={prev} />
          </div>
          <div className="space-y-6">
            <div className="card-paper p-6">
              <ParamControls params={["prevalence", "sens", "spec"]} />
            </div>
            <Guide size="sm">
              <p>
                Misma prueba (sens. {fmtPct(sens, 0)}, esp. {fmtPct(spec, 0)}). Con prevalencia de 1% el VPP sería{" "}
                <strong>{fmtPct(ppvAt(0.01, sens, spec), 0)}</strong>; con 50% sería{" "}
                <strong>{fmtPct(ppvAt(0.5, sens, spec), 0)}</strong>.
              </p>
            </Guide>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-paper p-6">
            <PatientGrid counts={counts} initialArrangement="resultado" />
          </div>
          <div className="card-paper p-6">
            <ContingencyTable highlight={["tp", "fp"]} />
            <p className="mt-4 text-sm text-muted-foreground">
              Resaltada la fila de positivos: el VPP es la parte verde de esa fila.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <Quiz
          question="Aplicas la misma prueba en el Hospital Meowl, donde la prevalencia es de 40%. Después, en un tamizaje poblacional, donde la prevalencia es del 1%. ¿Dónde será mayor el VPP?"
          options={[
            {
              text: "En el hospital de referencia",
              correct: true,
              why: "Con más enfermos entre los evaluados, una mayor parte de los positivos son verdaderos. El VPP sube con la prevalencia.",
            },
            {
              text: "En el tamizaje poblacional",
              why: "Al revés: con prevalencia baja casi todos los positivos vienen de la enorme masa de sanos, así que el VPP cae.",
            },
            {
              text: "Igual en ambos, porque la prueba es la misma",
              why: "Eso aplica a sensibilidad y especificidad, no a los valores predictivos. VPP y VPN dependen de la prevalencia.",
            },
          ]}
        />
      </Section>

      <ConceptPager current="/valores-predictivos" />
    </>
  );
}
