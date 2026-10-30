import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type PointerEvent } from "react";
import { Guide } from "@/components/site/Guide";
import { ConceptPager, PageHero, Section } from "@/components/site/PageParts";
import { Quiz } from "@/components/site/Quiz";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fmtNum, fmtPct, postTestProbability } from "@/lib/diagnostic";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/nomograma-de-fagan")({
  head: () => ({
    meta: [
      { title: "Nomograma de Fagan interactivo — Prueba & Error" },
      {
        name: "description",
        content: "Usa el nomograma de Fagan: une la probabilidad pre-prueba con el LR y lee la probabilidad post-prueba.",
      },
      { property: "og:title", content: "Nomograma de Fagan interactivo" },
      { property: "og:description", content: "Arrastra la línea y aplica Bayes sin calculadora." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NomogramPage,
});

const W = 440;
const H = 600;
const Y0 = H / 2;
const S = 37; // px per logit unit
const XL = 90;
const XM = 220;
const XR = 350;

const logit = (p: number) => Math.log(p / (1 - p));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const yLeft = (p: number) => Y0 + S * logit(p);
const yRight = (p: number) => Y0 - S * logit(p);
const yMid = (lr: number) => Y0 - (S * Math.log(lr)) / 2;

const PROB_TICKS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.98, 0.99, 0.995, 0.999];
const LR_TICKS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

const pctLabel = (p: number) => {
  const v = p * 100;
  return v < 1 || v > 99 ? v.toFixed(1) : v.toFixed(0);
};

function Nomogram({
  pre,
  lr,
  onPre,
  onLr,
}: {
  pre: number;
  lr: number;
  onPre: (p: number) => void;
  onLr: (lr: number) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<"pre" | "lr" | "post" | null>(null);
  const post = postTestProbability(pre, lr);
  const postClamped = clamp(post, 0.0005, 0.9995);
  const preY = yLeft(pre);
  const postY = yRight(postClamped);

  const toSvg = (e: PointerEvent) => {
    const svg = ref.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };

  const apply = (target: "pre" | "lr" | "post", y: number) => {
    const u = (y - Y0) / S;
    if (target === "pre") onPre(clamp(sigmoid(u), 0.001, 0.999));
    if (target === "lr") onLr(clamp(Math.exp(-2 * u), 0.001, 1000));
    if (target === "post") {
      const wanted = clamp(sigmoid(-u), 0.001, 0.999);
      onLr(clamp(wanted / (1 - wanted) / (pre / (1 - pre)), 0.001, 1000));
    }
  };

  const down = (e: PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e);
    const target = p.x < (XL + XM) / 2 ? "pre" : p.x < (XM + XR) / 2 ? "lr" : "post";
    setDragging(target);
    e.currentTarget.setPointerCapture(e.pointerId);
    apply(target, p.y);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (dragging) apply(dragging, toSvg(e).y);
  };

  // extend the line a little past both axes
  const dx = XR - XL;
  const dy = postY - preY;
  const ext = 0.08;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-ns-resize touch-none select-none"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={() => setDragging(null)}
      role="img"
      aria-label="Nomograma de Fagan"
    >
      {/* axes */}
      {[XL, XR].map((x) => (
        <line key={x} x1={x} x2={x} y1={yLeft(0.001)} y2={yLeft(0.999)} className="stroke-foreground" strokeWidth={2} />
      ))}
      <line x1={XM} x2={XM} y1={yMid(1000)} y2={yMid(0.001)} className="stroke-foreground" strokeWidth={2} />
      {PROB_TICKS.map((p) => (
        <g key={`l${p}`}>
          <line x1={XL - 6} x2={XL} y1={yLeft(p)} y2={yLeft(p)} className="stroke-foreground" />
          <text x={XL - 10} y={yLeft(p) + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
            {pctLabel(p)}
          </text>
          <line x1={XR} x2={XR + 6} y1={yRight(p)} y2={yRight(p)} className="stroke-foreground" />
          <text x={XR + 10} y={yRight(p) + 3} className="fill-muted-foreground font-mono text-[10px]">
            {pctLabel(p)}
          </text>
        </g>
      ))}
      {LR_TICKS.map((v) => (
        <g key={`m${v}`}>
          <line x1={XM - 5} x2={XM + 5} y1={yMid(v)} y2={yMid(v)} className="stroke-foreground" />
          <text x={XM + 9} y={yMid(v) + 3} className="fill-muted-foreground font-mono text-[10px]">
            {v}
          </text>
        </g>
      ))}
      <text x={XL} y={18} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
        Pre-prueba %
      </text>
      <text x={XM} y={18} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
        LR
      </text>
      <text x={XR} y={18} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
        Post-prueba %
      </text>

      {/* the ruler */}
      <line
        x1={XL - dx * ext}
        y1={preY - dy * ext}
        x2={XR + dx * ext}
        y2={postY + dy * ext}
        className="stroke-ochre"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={XL} cy={preY} r={8} className="fill-primary stroke-card" strokeWidth={3} />
      <circle cx={XM} cy={yMid(lr)} r={8} className="fill-foreground stroke-card" strokeWidth={3} />
      <circle cx={XR} cy={postY} r={8} className="fill-vp stroke-card" strokeWidth={3} />
    </svg>
  );
}

function NomogramPage() {
  const { m } = useStudy();
  const startPre = !Number.isNaN(m.prevalence) && m.prevalence > 0 && m.prevalence < 1 ? m.prevalence : 0.2;
  const [pre, setPre] = useState(clamp(startPre, 0.001, 0.999));
  const [lr, setLr] = useState(Number.isFinite(m.lrPos) ? clamp(m.lrPos, 0.001, 1000) : 5);
  const post = postTestProbability(pre, lr);

  return (
    <>
      <PageHero eyebrow="Tema 06" title="Nomograma de Fagan">
        Una regla en papel para hacer Bayes sin calculadora: une la probabilidad pre-prueba con el LR, dibuja la
        línea y lee la probabilidad post-prueba.
      </PageHero>

      <Section>
        <Guide>
          <p>
            ¡Arrastra directamente sobre el nomograma! Toca la columna izquierda para fijar tu sospecha inicial, la del
            centro para el LR, o la derecha para ver qué LR necesitarías para llegar a cierta probabilidad.
          </p>
        </Guide>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="card-paper p-4 md:p-6">
            <Nomogram pre={pre} lr={lr} onPre={setPre} onLr={setLr} />
          </div>
          <div className="space-y-6">
            <div className="card-paper space-y-6 p-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">Probabilidad pre-prueba</span>
                  <span className="num text-primary">{fmtPct(pre)}</span>
                </div>
                <Slider
                  min={logit(0.001)}
                  max={logit(0.999)}
                  step={0.01}
                  value={[logit(pre)]}
                  onValueChange={([v = 0]) => setPre(clamp(sigmoid(v), 0.001, 0.999))}
                  aria-label="Probabilidad pre-prueba"
                />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">Razón de verosimilitud</span>
                  <span className="num text-primary">{fmtNum(lr)}</span>
                </div>
                <Slider
                  min={-3}
                  max={3}
                  step={0.01}
                  value={[Math.log10(lr)]}
                  onValueChange={([v = 0]) => setLr(10 ** v)}
                  aria-label="Razón de verosimilitud"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={!Number.isFinite(m.lrPos)}
                    onClick={() => setLr(clamp(m.lrPos, 0.001, 1000))}
                  >
                    LR+ de mi estudio ({fmtNum(m.lrPos, 1)})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={!Number.isFinite(m.lrNeg) || m.lrNeg <= 0}
                    onClick={() => setLr(clamp(m.lrNeg, 0.001, 1000))}
                  >
                    LR− de mi estudio ({fmtNum(m.lrNeg, 2)})
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-foreground p-6 text-background">
              <p className="text-sm opacity-70">Probabilidad post-prueba</p>
              <p className="num font-display text-5xl font-semibold">{fmtPct(post)}</p>
              <p className="mt-2 text-sm opacity-70">
                {fmtPct(pre)} × efecto del LR {fmtNum(lr)} → {fmtPct(post)}
              </p>
            </div>
            <Guide size="sm">
              <p>
                {lr > 1
                  ? "Como el LR es mayor que 1, la línea sube: el resultado aumenta la probabilidad."
                  : lr < 1
                    ? "Como el LR es menor que 1, la línea baja: el resultado disminuye la probabilidad."
                    : "Con LR = 1 la línea es horizontal: el resultado no cambia nada."}
              </p>
            </Guide>
          </div>
        </div>
      </Section>

      <Section title="¿Por qué funciona?" kicker="Detrás de la regla">
        <div className="card-paper p-6 text-muted-foreground">
          <p>
            Las tres escalas son logarítmicas. Bayes en forma de odds dice: <strong className="text-foreground">odds post = odds pre × LR</strong>.
            Al sacar logaritmos, la multiplicación se vuelve una suma: log(odds post) = log(odds pre) + log(LR). Una
            suma así se puede resolver con una línea recta entre tres escalas, igual que una regla de cálculo.
          </p>
        </div>
      </Section>

      <Section>
        <Quiz
          question="Sospecha pre-prueba de 30% y una prueba con LR− = 0.05 sale negativa. ¿Más o menos qué probabilidad queda?"
          options={[
            { text: "Alrededor de 25%", why: "Un LR− de 0.05 es muy potente: debería bajar mucho más. Pruébalo en el nomograma." },
            {
              text: "Alrededor de 2%",
              correct: true,
              why: "Odds 0.43 × 0.05 ≈ 0.021 → probabilidad ≈ 2%. Un LR− < 0.1 suele descartar.",
            },
            { text: "0%", why: "Ninguna prueba lleva la probabilidad a cero; siempre queda algo de incertidumbre." },
          ]}
        />
      </Section>

      <ConceptPager current="/nomograma-de-fagan" />
    </>
  );
}
