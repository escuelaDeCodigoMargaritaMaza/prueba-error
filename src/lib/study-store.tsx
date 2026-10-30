import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { countsFromParams, metrics, type Counts, type Metrics } from "./diagnostic";

export const DEFAULT_COUNTS: Counts = countsFromParams(1000, 0.1, 0.9, 0.8);

type StudyContextValue = {
  counts: Counts;
  m: Metrics;
  setCounts: (c: Counts) => void;
  setCell: (cell: keyof Counts, value: number) => void;
  reset: () => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [counts, setCountsState] = useState<Counts>(DEFAULT_COUNTS);

  const value = useMemo<StudyContextValue>(() => {
    const clean = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(100000, Math.round(v))) : 0);
    return {
      counts,
      m: metrics(counts),
      setCounts: (c) =>
        setCountsState({ tp: clean(c.tp), fp: clean(c.fp), fn: clean(c.fn), tn: clean(c.tn) }),
      setCell: (cell, v) => setCountsState((prev) => ({ ...prev, [cell]: clean(v) })),
      reset: () => setCountsState(DEFAULT_COUNTS),
    };
  }, [counts]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
