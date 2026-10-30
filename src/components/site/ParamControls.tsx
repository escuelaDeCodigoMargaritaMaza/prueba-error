import { Slider } from "@/components/ui/slider";
import { countsFromParams } from "@/lib/diagnostic";
import { useStudy } from "@/lib/study-store";

type Param = "n" | "prevalence" | "sens" | "spec";

const CONFIG: Record<Param, { label: string; hint: string; min: number; max: number; step: number; pct: boolean }> = {
  n: { label: "Pacientes en el estudio", hint: "Tamaño de la población", min: 10, max: 10000, step: 10, pct: false },
  prevalence: { label: "Prevalencia", hint: "Proporción de enfermos", min: 0.001, max: 0.99, step: 0.001, pct: true },
  sens: { label: "Sensibilidad", hint: "Enfermos que salen positivos", min: 0, max: 1, step: 0.01, pct: true },
  spec: { label: "Especificidad", hint: "Sanos que salen negativos", min: 0, max: 1, step: 0.01, pct: true },
};

const orZero = (x: number) => (Number.isNaN(x) ? 0 : x);

/** Sliders that rebuild the shared 2x2 table from summary parameters. */
export function ParamControls({ params = ["n", "prevalence", "sens", "spec"] }: { params?: Param[] }) {
  const { m, setCounts } = useStudy();
  const current: Record<Param, number> = {
    n: m.total,
    prevalence: orZero(m.prevalence),
    sens: orZero(m.sens),
    spec: orZero(m.spec),
  };

  const update = (p: Param, v: number) => {
    const next = { ...current, [p]: v };
    setCounts(countsFromParams(Math.max(1, Math.round(next.n)), next.prevalence, next.sens, next.spec));
  };

  return (
    <div className="space-y-5">
      {params.map((p) => {
        const c = CONFIG[p];
        const value = current[p];
        return (
          <div key={p}>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.hint}</p>
              </div>
              {c.pct ? (
                <span className="num text-lg font-semibold text-primary">
                  {(value * 100).toFixed(p === "prevalence" && value < 0.1 ? 1 : 0)}%
                </span>
              ) : (
                <input
                  type="number"
                  min={c.min}
                  max={100000}
                  value={value}
                  onChange={(e) => update(p, Number(e.target.value))}
                  className="w-24 rounded-md border border-input bg-card px-2 py-1 text-right font-semibold text-primary outline-none focus:ring-2 focus:ring-ring"
                  aria-label={c.label}
                />
              )}
            </div>
            <Slider
              min={c.min}
              max={c.max}
              step={c.step}
              value={[Math.min(c.max, Math.max(c.min, value))]}
              onValueChange={([v = 0]) => update(p, v)}
              aria-label={c.label}
            />
          </div>
        );
      })}
    </div>
  );
}
