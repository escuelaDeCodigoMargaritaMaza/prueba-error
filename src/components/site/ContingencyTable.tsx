import type { Cell } from "@/lib/diagnostic";
import { useStudy } from "@/lib/study-store";
import { cn } from "@/lib/utils";
import { CELL_INFO } from "./cells";

function CellInput({ cell, dim }: { cell: Cell; dim: boolean }) {
  const { counts, setCell } = useStudy();
  const info = CELL_INFO[cell];
  return (
    <label
      className={cn(
        "flex flex-col gap-1 rounded-xl border-2 p-3 transition-opacity duration-300",
        info.soft,
        info.border,
        dim && "opacity-30",
      )}
    >
      <span className={cn("text-xs font-semibold", info.text)}>
        {info.short} · <span className="font-normal text-foreground/70">{info.name}</span>
      </span>
      <input
        type="number"
        min={0}
        value={counts[cell]}
        onChange={(e) => setCell(cell, Number(e.target.value))}
        className="w-full rounded-md border border-input bg-card px-2 py-1.5 text-lg font-semibold outline-none focus:ring-2 focus:ring-ring"
        aria-label={info.name}
      />
    </label>
  );
}

/** Editable 2x2 table bound to the shared study. */
export function ContingencyTable({ highlight }: { highlight?: Cell[] }) {
  const { m } = useStudy();
  const dim = (c: Cell) => !!highlight && !highlight.includes(c);
  const head = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

  return (
    <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 text-sm">
      <span />
      <span className={cn(head, "text-center")}>Enfermo</span>
      <span className={cn(head, "text-center")}>Sano</span>
      <span className={cn(head, "text-center")}>Total</span>

      <span className={cn(head, "pr-1")}>Prueba +</span>
      <CellInput cell="tp" dim={dim("tp")} />
      <CellInput cell="fp" dim={dim("fp")} />
      <span className="num px-2 text-center font-semibold">{m.testPos}</span>

      <span className={cn(head, "pr-1")}>Prueba −</span>
      <CellInput cell="fn" dim={dim("fn")} />
      <CellInput cell="tn" dim={dim("tn")} />
      <span className="num px-2 text-center font-semibold">{m.testNeg}</span>

      <span className={cn(head, "pr-1")}>Total</span>
      <span className="num text-center font-semibold">{m.sick}</span>
      <span className="num text-center font-semibold">{m.healthy}</span>
      <span className="num rounded-md bg-foreground px-2 py-1 text-center font-semibold text-background">
        {m.total}
      </span>
    </div>
  );
}
