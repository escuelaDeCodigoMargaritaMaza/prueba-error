import { useState } from "react";
import type { Cell, Counts } from "@/lib/diagnostic";
import { cn } from "@/lib/utils";
import { CELL_INFO } from "./cells";

const MAX_DOTS = 400;

function scaleCounts(counts: Counts, cells: Cell[]) {
  const total = cells.reduce((s, c) => s + counts[c], 0);
  const grand = counts.tp + counts.fp + counts.fn + counts.tn;
  if (grand <= MAX_DOTS) return { dots: counts, unit: 1 };
  const unit = grand / MAX_DOTS;
  // largest-remainder rounding so dots add up to MAX_DOTS
  const all: Cell[] = ["tp", "fn", "fp", "tn"];
  const raw = all.map((c) => counts[c] / unit);
  const floors = raw.map(Math.floor);
  let left = MAX_DOTS - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, rem: r - Math.floor(r) })).sort((a, b) => b.rem - a.rem);
  for (const o of order) {
    if (left <= 0) break;
    floors[o.i] = (floors[o.i] ?? 0) + 1;
    left -= 1;
  }
  void total;
  const dots = { tp: floors[0], fn: floors[1], fp: floors[2], tn: floors[3] } as Counts;
  return { dots, unit };
}

function Dot({ cell, dim }: { cell: Cell; dim: boolean }) {
  const info = CELL_INFO[cell];
  return (
    <span
      className={cn(
        "size-2.5 rounded-full transition-opacity duration-300 md:size-3",
        info.positive ? info.fill : cn("border-2 bg-transparent", info.border),
        dim && "opacity-15",
      )}
    />
  );
}

type Arrangement = "enfermedad" | "resultado";

export function PatientGrid({
  counts,
  highlight,
  initialArrangement = "enfermedad",
  showToggle = true,
}: {
  counts: Counts;
  highlight?: Cell[];
  initialArrangement?: Arrangement;
  showToggle?: boolean;
}) {
  const [arrangement, setArrangement] = useState<Arrangement>(initialArrangement);
  const [hover, setHover] = useState<Cell | null>(null);
  const { dots, unit } = scaleCounts(counts, ["tp", "fp", "fn", "tn"]);
  const active = hover ? [hover] : highlight;

  const groups: { label: string; cells: Cell[] }[] =
    arrangement === "enfermedad"
      ? [
          { label: "Enfermos", cells: ["tp", "fn"] },
          { label: "Sanos", cells: ["fp", "tn"] },
        ]
      : [
          { label: "Prueba positiva", cells: ["tp", "fp"] },
          { label: "Prueba negativa", cells: ["fn", "tn"] },
        ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {unit === 1 ? (
            <>Cada punto es <strong className="text-foreground">1 paciente</strong>.</>
          ) : (
            <>
              Cada punto ≈ <strong className="num text-foreground">{unit.toFixed(1)}</strong> pacientes.
            </>
          )}
        </p>
        {showToggle && (
          <div className="flex rounded-full border border-border bg-muted p-0.5 text-xs">
            {(["enfermedad", "resultado"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setArrangement(a)}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  arrangement === a ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                Agrupar por {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {groups.map((g) => {
        const n = g.cells.reduce((s, c) => s + counts[c], 0);
        return (
          <div key={g.label}>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {g.label} · <span className="num">{n}</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {g.cells.flatMap((c) =>
                Array.from({ length: dots[c] }, (_, i) => (
                  <Dot key={`${c}-${i}`} cell={c} dim={!!active && !active.includes(c)} />
                )),
              )}
              {n === 0 && <span className="text-xs text-muted-foreground">Nadie aquí.</span>}
            </div>
          </div>
        );
      })}

      <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
        {(["tp", "fp", "fn", "tn"] as const).map((c) => (
          <button
            key={c}
            onMouseEnter={() => setHover(c)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(c)}
            onBlur={() => setHover(null)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left text-xs"
          >
            <Dot cell={c} dim={false} />
            <span className="flex-1">{CELL_INFO[c].name}</span>
            <span className="num font-semibold">{counts[c]}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Punto relleno = prueba positiva · Anillo = prueba negativa. Pasa el cursor sobre los bloques para resaltarlos.
      </p>
    </div>
  );
}
