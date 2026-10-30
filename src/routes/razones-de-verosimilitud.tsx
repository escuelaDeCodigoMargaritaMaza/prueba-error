import { createFileRoute, Link } from "@tanstack/react-router";
import { FormulaCard, Fraction } from "@/components/site/Formula";
import { Guide } from "@/components/site/Guide";
import { ConceptPager, PageHero, Section } from "@/components/site/PageParts";
import { ParamControls } from "@/components/site/ParamControls";
import { Quiz } from "@/components/site/Quiz";
import { fmtNum, fmtPct, lrVerdict } from "@/lib/diagnostic";
import { useStudy } from "@/lib/study-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/razones-de-verosimilitud")({
  head: () => ({
    meta: [
      { title: "Razones de verosimilitud (LR+ y LR−) — Prueba & Error" },
      {
        name: "description",
        content: "Qué son las razones de verosimilitud positiva y negativa, cómo se calculan y cómo interpretarlas.",
      },
      { property: "og:title", content: "Razones de verosimilitud (LR+ y LR−)" },
      { property: "og:description", content: "Calcula e interpreta LR+ y LR− con una escala interactiva." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LRPage,
});

const MIN = Math.log10(0.01);
const MAX = Math.log10(100);
const pos = (lr: number) => {
  const v = lr === Infinity ? MAX : lr <= 0 ? MIN : Math.log10(lr);
  return ((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * 100;
};

const ZONES = [
  { from: 0.01, to: 0.1, cls: "bg-vn" },
  { from: 0.1, to: 0.2, cls: "bg-vn/60" },
  { from: 0.2, to: 0.5, cls: "bg-vn/30" },
  { from: 0.5, to: 2, cls: "bg-muted" },
  { from: 2, to: 5, cls: "bg-vp/30" },
  { from: 5, to: 10, cls: "bg-vp/60" },
  { from: 10, to: 100, cls: "bg-vp" },
];

function LRScale({ lrPos, lrNeg }: { lrPos: number; lrNeg: number }) {
  return (
    <div className="pb-10 pt-12">
      <div className="relative h-6 overflow-hidden rounded-full border border-border">
        {ZONES.map((z) => (
          <div
            key={z.from}
            className={cn("absolute inset-y-0", z.cls)}
            style={{ left: `${pos(z.from)}%`, width: `${pos(z.to) - pos(z.from)}%` }}
          />
        ))}
      </div>
      <div className="relative">
        {[0.01, 0.1, 0.2, 0.5, 1, 2, 5, 10, 100].map((t) => (
          <span
            key={t}
            className="num absolute top-2 -translate-x-1/2 text-[10px] text-muted-foreground"
            style={{ left: `${pos(t)}%` }}
          >
            {t}
          </span>
        ))}
        {[
          { v: lrNeg, label: "LR−", cls: "bg-fn" },
          { v: lrPos, label: "LR+", cls: "bg-primary" },
        ]
          .filter((mk) => !Number.isNaN(mk.v))
          .map((mk) => (
            <div
              key={mk.label}
              className="absolute -top-[4.25rem] flex -translate-x-1/2 flex-col items-center transition-all duration-300"
              style={{ left: `${pos(mk.v)}%` }}
            >
              <span className={cn("num rounded-md px-2 py-0.5 text-xs font-semibold text-primary-foreground", mk.cls)}>
                {mk.label} {fmtNum(mk.v)}
              </span>
              <span className={cn("h-9 w-0.5", mk.cls)} />
            </div>
          ))}
      </div>
      <div className="mt-8 flex justify-between text-xs text-muted-foreground">
        <span>← Descarta enfermedad</span>
        <span>No cambia nada</span>
        <span>Confirma enfermedad →</span>
      </div>
    </div>
  );
}

function LRPage() {
  const { m } = useStudy();
  return (
    <>
      <PageHero eyebrow="Tema 03" title="Razones de verosimilitud">
        Combinan sensibilidad y especificidad en un solo número que dice cuánto debe cambiar tu sospecha después de
        un resultado.
      </PageHero>

      <Section>
        <Guide>
          <p>
            Pregúntate: <em>¿cuántas veces es más probable este resultado en un enfermo que en un sano?</em>
          </p>
          <p>
            Un LR de 1 significa que el resultado aparece igual en ambos: no sirve. Cuanto más lejos de 1, más útil.
            Y lo mejor: <span className="marker">¡no dependen de la prevalencia!</span>.
          </p>
        </Guide>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormulaCard
            name="LR positivo (LR+)"
            accent="border-primary"
            result={fmtNum(m.lrPos)}
            symbolic={<Fraction num="Sensibilidad" den="1 − Especificidad" />}
            numeric={<Fraction num={fmtPct(m.sens)} den={fmtPct(1 - m.spec)} />}
          >
            Un positivo es <strong className="text-foreground">{fmtNum(m.lrPos, 1)} veces</strong> más frecuente en
            enfermos que en sanos. {lrVerdict(m.lrPos).label}.
          </FormulaCard>
          <FormulaCard
            name="LR negativo (LR−)"
            accent="border-fn"
            result={fmtNum(m.lrNeg)}
            symbolic={<Fraction num="1 − Sensibilidad" den="Especificidad" />}
            numeric={<Fraction num={fmtPct(1 - m.sens)} den={fmtPct(m.spec)} />}
          >
            Un negativo es {fmtNum(m.lrNeg, 2)} veces tan frecuente en enfermos como en sanos.{" "}
            {lrVerdict(m.lrNeg).label}.
          </FormulaCard>
        </div>
      </Section>

      <Section title="¿Qué tan bueno es tu LR?" kicker="Escala de interpretación">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="card-paper px-6 pb-4">
            <LRScale lrPos={m.lrPos} lrNeg={m.lrNeg} />
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {[
                  ["> 10  ó  < 0.1", "Cambio grande, a menudo concluyente"],
                  ["5–10  ó  0.1–0.2", "Cambio moderado"],
                  ["2–5  ó  0.2–0.5", "Cambio pequeño (a veces importante)"],
                  ["0.5–2", "Cambio mínimo, rara vez útil"],
                ].map(([r, t]) => (
                  <tr key={r}>
                    <td className="num py-2 pr-4">{r}</td>
                    <td className="py-2 text-muted-foreground">{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-6">
            <div className="card-paper p-6">
              <ParamControls params={["sens", "spec"]} />
            </div>
            <Guide size="sm">
              <p>
                ¿Y cómo uso el LR? Lo multiplicas por los <em>odds</em> pre-prueba. Te lo enseño en{" "}
                <Link to="/teorema-de-bayes" className="font-semibold text-primary underline">
                  Bayes
                </Link>{" "}
                y en el{" "}
                <Link to="/nomograma-de-fagan" className="font-semibold text-primary underline">
                  nomograma
                </Link>
                .
              </p>
            </Guide>
          </div>
        </div>
      </Section>

      <Section>
        <Quiz
          question="Un signo clínico tiene LR+ = 1.2. ¿Qué tan útil es si está presente?"
          options={[
            {
              text: "Muy útil: confirma el diagnóstico",
              why: "Para confirmar necesitas un LR+ grande (idealmente > 10). 1.2 apenas mueve la probabilidad.",
            },
            {
              text: "Casi inútil: apenas cambia la probabilidad",
              correct: true,
              why: "Exacto. Un LR cercano a 1 significa que el hallazgo aparece casi igual en enfermos y en sanos.",
            },
            {
              text: "Descarta la enfermedad",
              why: "Un LR mayor que 1 nunca descarta: si acaso, aumenta (un poquito) la probabilidad.",
            },
          ]}
        />
      </Section>

      <ConceptPager current="/razones-de-verosimilitud" />
    </>
  );
}
