import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Fraction } from "@/components/site/Formula";
import { Guide } from "@/components/site/Guide";
import { ConceptPager, PageHero, Section } from "@/components/site/PageParts";
import { ParamControls } from "@/components/site/ParamControls";
import { Quiz } from "@/components/site/Quiz";
import { Slider } from "@/components/ui/slider";
import { fmtNum, fmtPct, oddsToProb, probToOdds } from "@/lib/diagnostic";
import { useStudy } from "@/lib/study-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teorema-de-bayes")({
  head: () => ({
    meta: [
      { title: "Teorema de Bayes para pruebas diagnósticas — Prueba & Error" },
      {
        name: "description",
        content: "De probabilidad pre-prueba a post-prueba: Bayes con frecuencias naturales y con odds, paso a paso.",
      },
      { property: "og:title", content: "Teorema de Bayes para pruebas diagnósticas" },
      { property: "og:description", content: "Calcula la probabilidad post-prueba con frecuencias naturales y odds." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BayesPage,
});

function Box({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={cn("rounded-xl border-2 px-3 py-2 text-center", cls)}>
      <p className="text-[11px] uppercase tracking-wider text-foreground/70">{label}</p>
      <p className="num text-xl font-semibold">{value}</p>
    </div>
  );
}

function FrequencyTree() {
  const { counts, m } = useStudy();
  return (
    <div className="space-y-3">
      <div className="mx-auto w-40">
        <Box label="Población" value={m.total} cls="border-foreground bg-card" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-center text-xs text-muted-foreground">× prevalencia ({fmtPct(m.prevalence)})</p>
          <Box label="Enfermos" value={m.sick} cls="border-foreground/40 bg-muted" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-center text-[11px] text-muted-foreground">× sens.</p>
              <Box label="VP" value={counts.tp} cls="border-vp bg-vp-soft" />
            </div>
            <div className="space-y-1">
              <p className="text-center text-[11px] text-muted-foreground">× (1 − sens.)</p>
              <Box label="FN" value={counts.fn} cls="border-fn bg-fn-soft" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-center text-xs text-muted-foreground">× (1 − prevalencia)</p>
          <Box label="Sanos" value={m.healthy} cls="border-foreground/40 bg-muted" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-center text-[11px] text-muted-foreground">× (1 − esp.)</p>
              <Box label="FP" value={counts.fp} cls="border-fp bg-fp-soft" />
            </div>
            <div className="space-y-1">
              <p className="text-center text-[11px] text-muted-foreground">× esp.</p>
              <Box label="VN" value={counts.tn} cls="border-vn bg-vn-soft" />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-foreground p-4 text-center text-background">
        <p className="text-sm opacity-80">Probabilidad de enfermedad si la prueba es positiva</p>
        <p className="mt-1 flex items-center justify-center gap-3 text-lg">
          <Fraction num={<span className="num">VP {counts.tp}</span>} den={<span className="num">VP {counts.tp} + FP {counts.fp}</span>} />
          <span>=</span>
          <span className="num text-3xl font-semibold">{fmtPct(m.ppv)}</span>
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="num flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
        {n}
      </span>
      <div className="flex-1 border-b border-border pb-4">
        <p className="font-semibold">{title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function OddsCalculator() {
  const { m } = useStudy();
  const [pre, setPre] = useState(0.1);
  const [which, setWhich] = useState<"pos" | "neg" | "custom">("pos");
  const [custom, setCustom] = useState(5);

  useEffect(() => {
    if (!Number.isNaN(m.prevalence) && m.prevalence > 0 && m.prevalence < 1) setPre(m.prevalence);
    // only on first mount: start from the lab's prevalence
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lr = which === "pos" ? m.lrPos : which === "neg" ? m.lrNeg : custom;
  const preOdds = probToOdds(pre);
  const postOdds = preOdds * lr;
  const post = oddsToProb(postOdds);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card-paper space-y-6 p-6">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold">Probabilidad pre-prueba</span>
            <span className="num text-primary">{fmtPct(pre)}</span>
          </div>
          <Slider min={0.005} max={0.99} step={0.005} value={[pre]} onValueChange={([v = 0]) => setPre(v)} aria-label="Probabilidad pre-prueba" />
          <p className="mt-2 text-xs text-muted-foreground">
            Tu sospecha clínica antes de la prueba (o la prevalencia en tu población).
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Resultado de la prueba</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {(
              [
                ["pos", `Positivo (LR+ ${fmtNum(m.lrPos, 1)})`],
                ["neg", `Negativo (LR− ${fmtNum(m.lrNeg, 2)})`],
                ["custom", "Otro LR"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setWhich(k)}
                className={cn(
                  "rounded-lg border-2 px-2 py-2 transition-colors",
                  which === k ? "border-primary bg-secondary" : "border-border bg-card",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          {which === "custom" && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>LR</span>
                <span className="num text-primary">{fmtNum(custom)}</span>
              </div>
              <Slider
                min={-2}
                max={2}
                step={0.01}
                value={[Math.log10(custom)]}
                onValueChange={([v = 0]) => setCustom(Number((10 ** v).toPrecision(3)))}
                aria-label="LR personalizado"
              />
            </div>
          )}
        </div>
      </div>

      <div className="card-paper space-y-4 p-6">
        <Step n={1} title="Probabilidad → odds">
          <Fraction num={fmtPct(pre)} den={`1 − ${fmtPct(pre)}`} /> = <strong className="num text-foreground">{fmtNum(preOdds, 3)}</strong>
        </Step>
        <Step n={2} title="Multiplica por el LR">
          <span className="num">
            {fmtNum(preOdds, 3)} × {fmtNum(lr)} = <strong className="text-foreground">{fmtNum(postOdds, 3)}</strong>
          </span>
        </Step>
        <Step n={3} title="Odds → probabilidad">
          <Fraction num={fmtNum(postOdds, 3)} den={`1 + ${fmtNum(postOdds, 3)}`} />
        </Step>
        <div className="rounded-xl bg-primary p-5 text-primary-foreground">
          <p className="text-sm opacity-80">Probabilidad post-prueba</p>
          <p className="num font-display text-5xl font-semibold">{fmtPct(post)}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-foreground/20">
            <div className="h-full bg-ochre transition-all duration-300" style={{ width: `${(Number.isNaN(post) ? 0 : post) * 100}%` }} />
          </div>
          <p className="mt-2 text-sm opacity-80">
            Antes: {fmtPct(pre)} → Después: {fmtPct(post)}
          </p>
        </div>
      </div>
    </div>
  );
}

function BayesPage() {
  return (
    <>
      <PageHero eyebrow="Tema 05" title="Teorema de Bayes">
        Bayes es la regla para actualizar lo que crees cuando llega información nueva. En medicina: de la probabilidad
        <em> antes</em> de la prueba, a la probabilidad <em>después</em>.
      </PageHero>

      <Section>
        <Guide>
          <p>
            Te enseño dos caminos que llegan al mismo lugar. El primero, con <strong>frecuencias naturales</strong>:
            imaginemos personas reales y contémoslas. El segundo, con <strong>odds y LR</strong>, para que seas más rápido en la consulta.
          </p>
        </Guide>
      </Section>

      <Section title="Camino 1: frecuencias naturales" kicker="Cuenta personas">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="card-paper p-6">
            <FrequencyTree />
          </div>
          <div className="space-y-6">
            <div className="card-paper p-6">
              <ParamControls />
            </div>
            <div className="card-paper p-6 text-sm">
              <p className="eyebrow mb-3">La fórmula clásica</p>
              <div className="flex flex-wrap items-center gap-2">
                <span>P(E | +) =</span>
                <Fraction num="sens × p" den="sens × p + (1 − esp) × (1 − p)" />
              </div>
              <p className="mt-3 text-muted-foreground">
                Es exactamente lo que hace el árbol: VP arriba y todos los positivos abajo.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Camino 2: odds × LR" kicker="Pocket Edition">
        <OddsCalculator />
        <Guide size="sm" className="mt-6">
          <p>
            Los <em>odds</em> son “a favor vs. en contra”. Una probabilidad de 20% equivale a odds de 20:80 = 0.25.
            Odds post-prueba = odds pre-prueba × LR. ¡Así de simple!
          </p>
        </Guide>
      </Section>

      <Section>
        <Quiz
          question="Mamografía: prevalencia 1%, sensibilidad 80%, falsos positivos 9.6%. Una mujer sale positiva. ¿Probabilidad de cáncer?"
          options={[
            { text: "Alrededor de 80%", why: "Ése es el error más común: confundir sensibilidad con VPP. La prevalencia baja lo cambia todo." },
            {
              text: "Alrededor de 8%",
              correct: true,
              why: "De 1000 mujeres: 10 con cáncer → 8 positivas; 990 sanas → 95 positivas. 8 / (8 + 95) ≈ 7.8%.",
            },
            { text: "Alrededor de 50%", why: "Prueba hacerlo con el árbol: 8 verdaderos positivos contra 95 falsos positivos." },
          ]}
        />
      </Section>

      <ConceptPager current="/teorema-de-bayes" />
    </>
  );
}
