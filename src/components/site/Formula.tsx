import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Fraction({ num, den, className }: { num: ReactNode; den: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-center align-middle leading-tight", className)}>
      <span className="px-1 pb-0.5">{num}</span>
      <span className="w-full border-t-[1.5px] border-current px-1 pt-0.5">{den}</span>
    </span>
  );
}

/** A formula card: name, symbolic formula, the same formula with the live numbers, and the result. */
export function FormulaCard({
  name,
  symbolic,
  numeric,
  result,
  children,
  accent = "border-primary",
}: {
  name: string;
  symbolic: ReactNode;
  numeric: ReactNode;
  result: string;
  children?: ReactNode;
  accent?: string;
}) {
  return (
    <div className={cn("card-paper border-t-4 p-5", accent)}>
      <p className="eyebrow">{name}</p>
      <p className="mt-1 font-display text-4xl font-semibold num">{result}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground">{symbolic}</span>
        <span className="text-muted-foreground">=</span>
        <span className="num">{numeric}</span>
      </div>
      {children && <div className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</div>}
    </div>
  );
}
