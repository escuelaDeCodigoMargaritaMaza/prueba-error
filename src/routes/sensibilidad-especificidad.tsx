import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContingencyTable } from "@/components/site/ContingencyTable";
import { FormulaCard, Fraction } from "@/components/site/Formula";
import { Guide } from "@/components/site/Guide";
import { ConceptPager, PageHero, Section } from "@/components/site/PageParts";
import { ParamControls } from "@/components/site/ParamControls";
import { PatientGrid } from "@/components/site/PatientGrid";
import { Quiz } from "@/components/site/Quiz";
import type { Cell } from "@/lib/diagnostic";
import { fmtPct } from "@/lib/diagnostic";
import { useStudy } from "@/lib/study-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sensibilidad-especificidad")({
  head: () => ({
    meta: [
      { title: "Sensibilidad y especificidad, explicadas — Prueba & Error" },
      {
        name: "description",
        content: "Qué son la sensibilidad y la especificidad, cómo se calculan y qué significan SnNout y SpPin.",
      },
      { property: "og:title", content: "Sensibilidad y especificidad, explicadas" },
      { property: "og:description", content: "Calcula sensibilidad y especificidad con tu propia tabla 2×2." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SensSpecPage,
});

function SensSpecPage() {
  const { counts, m } = useStudy();
  const [focus, setFocus] = useState<"sens" | "spec">("sens");
  const highlight: Cell[] = focus === "sens" ? ["tp", "fn"] : ["fp", "tn"];

  return (
    <>
      <PageHero eyebrow="Tema 01" title={<>Sensibilidad y especificidad</>}>
        Dos preguntas sobre la prueba: ¿qué tan bien reconoce a quien <em>sí</em> tiene la enfermedad, y a quien{" "}
        <em>no</em> la tiene?
      </PageHero>

      <Section>
        <Guide>
          <p>
            Ambas las puedes leer <strong>por columnas</strong>. La sensibilidad sólo mira a los enfermos; la
            especificidad sólo mira a los sanos. Por eso <span className="marker">no cambian con la prevalencia</span>.
          </p>
        </Guide>
      </Section>

      <Section>
        <div className="mb-4 flex rounded-full border border-border bg-muted p-1 text-sm md:w-fit">
          {(
            [
              ["sens", "Ver sensibilidad"],
              ["spec", "Ver especificidad"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFocus(k)}
              className={cn(
                "flex-1 rounded-full px-4 py-1.5 transition-colors md:flex-none",
                focus === k ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {focus === "sens" ? (
              <FormulaCard
                name="Sensibilidad"
                accent="border-vp"
                result={fmtPct(m.sens)}
                symbolic={<Fraction num="VP" den="VP + FN" />}
                numeric={<Fraction num={counts.tp} den={`${counts.tp} + ${counts.fn}`} />}
              >
                De cada 100 enfermos, la prueba detecta a <strong className="text-foreground">{fmtPct(m.sens, 0)}</strong>.
                El resto ({counts.fn} pacientes) son falsos negativos: enfermos que se van a casa tranquilos.
              </FormulaCard>
            ) : (
              <FormulaCard
                name="Especificidad"
                accent="border-vn"
                result={fmtPct(m.spec)}
                symbolic={<Fraction num="VN" den="VN + FP" />}
                numeric={<Fraction num={counts.tn} den={`${counts.tn} + ${counts.fp}`} />}
              >
                De cada 100 sanos, la prueba sale negativa en{" "}
                <strong className="text-foreground">{fmtPct(m.spec, 0)}</strong>. Los otros {counts.fp} son falsos
                positivos: sanos que reciben un susto (y quizá más estudios).
              </FormulaCard>
            )}
            <div className="card-paper p-6">
              <ContingencyTable highlight={highlight} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="card-paper p-6">
              <PatientGrid counts={counts} highlight={highlight} showToggle={false} />
            </div>
            <div className="card-paper p-6">
              <ParamControls params={["sens", "spec", "prevalence"]} />
              <p className="mt-4 text-xs text-muted-foreground">
                Mueve la prevalencia y mira... ¡la sensibilidad y la especificidad se quedan igual!
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="¿Cuándo aumentar cada uno?" kicker="Recuerda">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card-paper p-6">
            <p className="font-display text-3xl font-semibold text-vp">SeNsibilidad</p>
            <p className="mt-2 text-muted-foreground">
              <strong className="text-foreground">S</strong>ensibilidad alta + resultado{" "}
              <strong className="text-foreground">N</strong>egativo = descartar. Ideal para un
              tamizaje, cuando no queremos que se escape nadie.
            </p>
          </div>
          <div className="card-paper p-6">
            <p className="font-display text-3xl font-semibold text-vn">EsPecificidad</p>
            <p className="mt-2 text-muted-foreground">
              <strong className="text-foreground">E</strong>specificidad alta + resultado{" "}
              <strong className="text-foreground">P</strong>ositivo = confirmar. Ideal para
              confirmar antes de un tratamiento agresivo (para el paciente o para la cartera).
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <Quiz
          question="Una prueba tiene sensibilidad del 99% y especificidad del 70%. Tu paciente sale negativo. ¿Qué haces?"
          options={[
            {
              text: "Descarto razonablemente la enfermedad",
              correct: true,
              why: "¡Eso es! Con sensibilidad tan alta casi no hay falsos negativos, así que un negativo es muy tranquilizador.",
            },
            {
              text: "Confirmo la enfermedad",
              why: "Un negativo nunca confirma. Además, para confirmar necesitarías alta especificidad.",
            },
            {
              text: "No puedo concluir nada sin la prevalencia",
              why: "La prevalencia afecta los valores predictivos, pero con 99% de sensibilidad un negativo descarta en casi cualquier escenario clínico habitual.",
            },
          ]}
        />
      </Section>

      <ConceptPager current="/sensibilidad-especificidad" />
    </>
  );
}
