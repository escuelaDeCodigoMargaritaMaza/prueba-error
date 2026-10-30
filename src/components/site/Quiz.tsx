import { useState } from "react";
import { cn } from "@/lib/utils";
import { Guide } from "./Guide";

type Option = { text: string; correct?: boolean; why: string };

export function Quiz({ question, options }: { question: string; options: Option[] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const chosen = picked !== null ? options[picked] : null;

  return (
    <div className="card-paper p-6">
      <p className="eyebrow">¡Quiz!</p>
      <p className="mt-2 font-display text-xl font-semibold">{question}</p>
      <div className="mt-4 grid gap-2">
        {options.map((o, i) => (
          <button
            key={i}
            onClick={() => setPicked(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors",
              picked === i
                ? o.correct
                  ? "border-vp bg-vp-soft"
                  : "border-fn bg-fn-soft"
                : "border-border bg-card hover:border-primary",
            )}
          >
            <span className="mr-2 font-mono text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
            {o.text}
          </button>
        ))}
      </div>
      {chosen && (
        <Guide size="sm" className="mt-6" title={chosen.correct ? "¡Correcto!" : "Casi…"}>
          <p>{chosen.why}</p>
        </Guide>
      )}
    </div>
  );
}
