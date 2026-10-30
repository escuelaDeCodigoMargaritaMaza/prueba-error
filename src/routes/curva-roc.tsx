import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { Guide } from "@/components/site/Guide";
import { ConceptPager, PageHero, Section } from "@/components/site/PageParts";
import { Quiz } from "@/components/site/Quiz";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { binormalAuc, binormalPoint, countsFromParams, fmtNum, fmtPct, normPdf } from "@/lib/diagnostic";
import { useStudy } from "@/lib/study-store";
import { toast } from "sonner";

export const Route = createFileRoute("/curva-roc")({
  head: () => ({
    meta: [
      { title: "Curva ROC interactiva y área bajo la curva — Prueba & Error" },
      {
        name: "description",
        content: "Mueve el punto de corte de una prueba y observa cómo cambian sensibilidad, especificidad y la curva ROC.",
      },
      { property: "og:title", content: "Curva ROC interactiva" },
      { property: "og:description", content: "Explora el punto de corte, el AUC y el equilibrio sensibilidad–especificidad." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RocPage,
});

const XMIN = -4;
const XMAX = 8;

function Distributions({ sep, thr }: { sep: number; thr: number }) {
  const W = 560;
  const H = 240;
  const P = { l: 12, r: 12, t: 12, b: 32 };
  const x = (v: number) => P.l + ((v - XMIN) / (XMAX - XMIN)) * (W - P.l - P.r);
  const y = (d: number) => H - P.b - (d / 0.42) * (H - P.t - P.b);
  const xs = Array.from({ length: 241 }, (_, i) => XMIN + (i / 240) * (XMAX - XMIN));
  const area = (mean: number, from: number, to: number) => {
    const seg = xs.filter((v) => v >= from && v <= to);
    if (seg.length < 2) return "";
    return (
      `M${x(seg[0]!)},${y(0)} ` +
      seg.map((v) => `L${x(v).toFixed(1)},${y(normPdf(v, mean)).toFixed(1)}`).join(" ") +
      ` L${x(seg[seg.length - 1]!)},${y(0)} Z`
    );
  };
  const curve = (mean: number) =>
    xs.map((v, i) => `${i ? "L" : "M"}${x(v).toFixed(1)},${y(normPdf(v, mean)).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Distribuciones de sanos y enfermos">
      <path d={area(0, XMIN, thr)} className="fill-vn/30" />
      <path d={area(0, thr, XMAX)} className="fill-fp/60" />
      <path d={area(sep, XMIN, thr)} className="fill-fn/50" />
      <path d={area(sep, thr, XMAX)} className="fill-vp/40" />
      <path d={curve(0)} className="fill-none stroke-vn" strokeWidth={2.5} />
      <path d={curve(sep)} className="fill-none stroke-vp" strokeWidth={2.5} />
      <line x1={P.l} x2={W - P.r} y1={y(0)} y2={y(0)} className="stroke-foreground/40" />
      <line x1={x(thr)} x2={x(thr)} y1={P.t} y2={y(0)} className="stroke-foreground" strokeWidth={2} strokeDasharray="5 4" />
      <text x={x(thr)} y={H - 10} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
        punto de corte
      </text>
      <text x={x(0)} y={y(0.4) - 4} textAnchor="middle" className="fill-vn text-[12px] font-semibold">
        Sanos
      </text>
      <text x={x(sep)} y={y(0.4) - 4} textAnchor="middle" className="fill-vp text-[12px] font-semibold">
        Enfermos
      </text>
    </svg>
  );
}

function RocChart({ sep, thr, labPoint }: { sep: number; thr: number; labPoint?: { fpr: number; tpr: number } | undefined }) {
  const S = 300;
  const P = 36;
  const sx = (v: number) => P + v * (S - P - 10);
  const sy = (v: number) => S - P - v * (S - P - 10);
  const ts = Array.from({ length: 121 }, (_, i) => XMAX - (i / 120) * (XMAX - XMIN));
  const d = ts
    .map((t, i) => {
      const p = binormalPoint(sep, t);
      return `${i ? "L" : "M"}${sx(1 - p.spec).toFixed(1)},${sy(p.sens).toFixed(1)}`;
    })
    .join(" ");
  const cur = binormalPoint(sep, thr);
  const area = `${d} L${sx(1)},${sy(0)} L${sx(0)},${sy(0)} Z`;

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full" role="img" aria-label="Curva ROC">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <text x={sx(t)} y={S - P + 16} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
            {t}
          </text>
          <text x={P - 8} y={sy(t) + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
            {t}
          </text>
        </g>
      ))}
      <rect x={sx(0)} y={sy(1)} width={sx(1) - sx(0)} height={sy(0) - sy(1)} className="fill-none stroke-border" />
      <path d={area} className="fill-primary/10" />
      <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} className="stroke-muted-foreground" strokeDasharray="4 4" />
      <path d={d} className="fill-none stroke-primary" strokeWidth={3} />
      {labPoint && (
        <g>
          <rect x={sx(labPoint.fpr) - 5} y={sy(labPoint.tpr) - 5} width={10} height={10} className="fill-ochre stroke-card" strokeWidth={2} transform={`rotate(45 ${sx(labPoint.fpr)} ${sy(labPoint.tpr)})`} />
        </g>
      )}
      <circle cx={sx(1 - cur.spec)} cy={sy(cur.sens)} r={7} className="fill-foreground stroke-card" strokeWidth={2.5} />
      <text x={(S + P) / 2} y={S - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        1 − Especificidad (falsos positivos)
      </text>
      <text x={10} y={S / 2} textAnchor="middle" transform={`rotate(-90 10 ${S / 2})`} className="fill-muted-foreground text-[10px]">
        Sensibilidad (verdaderos positivos)
      </text>
    </svg>
  );
}

function RocPage() {
  const { m, setCounts } = useStudy();
  const [sep, setSep] = useState(2);
  const [thr, setThr] = useState(1);
  const p = binormalPoint(sep, thr);
  const auc = binormalAuc(sep);
  const youden = p.sens + p.spec - 1;
  const labPoint =
    Number.isNaN(m.sens) || Number.isNaN(m.spec) ? undefined : { fpr: 1 - m.spec, tpr: m.sens };

  const aucLabel =
    auc >= 0.9 ? "excelente" : auc >= 0.8 ? "buena" : auc >= 0.7 ? "aceptable" : auc > 0.6 ? "pobre" : "casi azar";

  const sendToLab = () => {
    const prev = Number.isNaN(m.prevalence) ? 0.1 : m.prevalence;
    setCounts(countsFromParams(m.total || 1000, prev, p.sens, p.spec));
    toast.success("Listo: tu laboratorio ahora usa esta sensibilidad y especificidad.");
  };

  return (
    <>
      <PageHero eyebrow="Tema 04" title="Curvas ROC">
        Muchas pruebas dan un número (glucosa, troponina, PSA). Hay que elegir a partir de qué valor llamamos
        “positivo”. Ese punto de corte decide el equilibrio entre sensibilidad y especificidad.
      </PageHero>

      <Section>
        <Guide>
          <p>
            ¡Esta es mi parte favorita!
          </p>
          <p>
            Mueve el <strong>punto de corte</strong>: si lo bajas, atrapas más enfermos (aumentas la sensibilidad) pero también
            más sanos (disminuyes la especificidad). La curva ROC dibuja <em>todos</em> los puntos de corte posibles a la vez.
          </p>
          <p>
            Y mueve la <strong>separación</strong>: cuanto más separadas están las campanas, mejor discrimina la prueba
            y más se acerca la curva a la esquina superior izquierda.
          </p>
        </Guide>
      </Section>

      <Section>
        <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="card-paper space-y-6 p-6">
            <Distributions sep={sep} thr={thr} />
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">Punto de corte</span>
                  <span className="num text-primary">{thr.toFixed(2)}</span>
                </div>
                <Slider min={-3} max={6} step={0.05} value={[thr]} onValueChange={([v = 0]) => setThr(v)} aria-label="Punto de corte" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">Separación entre grupos</span>
                  <span className="num text-primary">{sep.toFixed(2)}</span>
                </div>
                <Slider min={0} max={4} step={0.05} value={[sep]} onValueChange={([v = 0]) => setSep(v)} aria-label="Separación" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-vp/40" />VP</span>
              <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-fn/50" />FN</span>
              <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-fp/60" />FP</span>
              <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-vn/30" />VN</span>
            </div>
          </div>
          <div className="card-paper p-6">
            <RocChart sep={sep} thr={thr} labPoint={labPoint} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Sensibilidad", fmtPct(p.sens)],
                ["Especificidad", fmtPct(p.spec)],
                ["Área bajo la curva (AUC)", fmtNum(auc)],
                ["Índice de Youden", fmtNum(youden)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">{l}</p>
                  <p className="num text-xl font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              ● punto de corte actual · ◆ tu estudio del laboratorio
            </p>
            <Button onClick={sendToLab} variant="outline" className="mt-4 w-full rounded-full">
              <FlaskConical /> Usar este punto en mi laboratorio
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Cómo leer la curva" kicker="Claves">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card-paper p-6">
            <p className="font-display text-xl font-semibold">Área bajo la curva (AUC)</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Probabilidad de que un enfermo al azar tenga un valor más alto que un sano al azar. 0.5 = moneda al aire; 1
              = perfecta. Ahora mismo: <strong className="text-foreground">{fmtNum(auc)} ({aucLabel})</strong>.
            </p>
          </div>
          <div className="card-paper p-6">
            <p className="font-display text-xl font-semibold">La diagonal</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Una prueba sobre la línea punteada no discrimina nada: da positivos igual a enfermos y a sanos (LR = 1).
            </p>
          </div>
          <div className="card-paper p-6">
            <p className="font-display text-xl font-semibold">Índice de Youden</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sensibilidad + especificidad − 1. El punto de corte que lo maximiza es el más alejado de la diagonal; la
              pendiente de la curva en cada punto es el LR de ese valor.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <Quiz
          question="Para un tamizaje donde no quieres que se escape ningún caso, ¿hacia dónde mueves el punto de corte?"
          options={[
            {
              text: "Hacia valores más bajos (a la izquierda)",
              correct: true,
              why: "Bajar el corte hace que más personas salgan positivas: ganas sensibilidad a costa de especificidad. Ideal para tamizaje.",
            },
            {
              text: "Hacia valores más altos (a la derecha)",
              why: "Eso sube la especificidad y baja la sensibilidad: se te escaparían más enfermos.",
            },
            {
              text: "Da igual: el AUC no cambia",
              why: "El AUC es una propiedad de toda la curva, pero el punto de corte sí cambia la sensibilidad y especificidad que usas en la práctica.",
            },
          ]}
        />
      </Section>

      <ConceptPager current="/curva-roc" />
    </>
  );
}
