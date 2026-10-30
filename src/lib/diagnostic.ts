/** Pure maths for diagnostic-test statistics. No React here. */

export type Counts = { tp: number; fp: number; fn: number; tn: number };
export type Cell = keyof Counts;

const ratio = (num: number, den: number) => (den === 0 ? NaN : num / den);

export function metrics(c: Counts) {
  const sick = c.tp + c.fn;
  const healthy = c.fp + c.tn;
  const testPos = c.tp + c.fp;
  const testNeg = c.fn + c.tn;
  const total = sick + healthy;
  const sens = ratio(c.tp, sick);
  const spec = ratio(c.tn, healthy);
  return {
    total,
    sick,
    healthy,
    testPos,
    testNeg,
    sens,
    spec,
    ppv: ratio(c.tp, testPos),
    npv: ratio(c.tn, testNeg),
    prevalence: ratio(sick, total),
    accuracy: ratio(c.tp + c.tn, total),
    lrPos: likelihoodRatioPositive(sens, spec),
    lrNeg: likelihoodRatioNegative(sens, spec),
  };
}

export type Metrics = ReturnType<typeof metrics>;

export function likelihoodRatioPositive(sens: number, spec: number) {
  if (Number.isNaN(sens) || Number.isNaN(spec)) return NaN;
  if (spec === 1) return sens === 0 ? NaN : Infinity;
  return sens / (1 - spec);
}

export function likelihoodRatioNegative(sens: number, spec: number) {
  if (Number.isNaN(sens) || Number.isNaN(spec)) return NaN;
  if (spec === 0) return sens === 1 ? NaN : Infinity;
  return (1 - sens) / spec;
}

/** Build a 2x2 table from population size, prevalence, sensitivity and specificity. */
export function countsFromParams(n: number, prevalence: number, sens: number, spec: number): Counts {
  const sick = Math.round(n * prevalence);
  const healthy = n - sick;
  const tp = Math.round(sick * sens);
  const tn = Math.round(healthy * spec);
  return { tp, fn: sick - tp, tn, fp: healthy - tn };
}

export function probToOdds(p: number) {
  return p >= 1 ? Infinity : p / (1 - p);
}

export function oddsToProb(o: number) {
  return o === Infinity ? 1 : o / (1 + o);
}

/** Bayes in odds form: post-test odds = pre-test odds × LR. */
export function postTestProbability(preTest: number, lr: number) {
  return oddsToProb(probToOdds(preTest) * lr);
}

/** PPV / NPV as a function of prevalence for fixed sens/spec (Bayes). */
export function ppvAt(prev: number, sens: number, spec: number) {
  return ratio(sens * prev, sens * prev + (1 - spec) * (1 - prev));
}
export function npvAt(prev: number, sens: number, spec: number) {
  return ratio(spec * (1 - prev), spec * (1 - prev) + (1 - sens) * prev);
}

/** Standard normal CDF (Abramowitz & Stegun 7.1.26). */
export function normCdf(x: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-(x * x) / 2);
  return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

export function normPdf(x: number, mean = 0) {
  const z = x - mean;
  return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
}

/**
 * Binormal model: healthy ~ N(0,1), sick ~ N(separation,1).
 * A result above `threshold` is called positive.
 */
export function binormalPoint(separation: number, threshold: number) {
  return { sens: 1 - normCdf(threshold - separation), spec: normCdf(threshold) };
}

export function binormalAuc(separation: number) {
  return normCdf(separation / Math.SQRT2);
}

export function lrVerdict(lr: number): { label: string; tone: "strong" | "moderate" | "weak" | "none" } {
  if (Number.isNaN(lr)) return { label: "No calculable", tone: "none" };
  if (lr >= 10 || lr <= 0.1) return { label: "Cambio grande y a menudo concluyente", tone: "strong" };
  if (lr >= 5 || lr <= 0.2) return { label: "Cambio moderado", tone: "moderate" };
  if (lr >= 2 || lr <= 0.5) return { label: "Cambio pequeño (a veces importante)", tone: "weak" };
  return { label: "Cambio mínimo, rara vez útil", tone: "none" };
}

export function fmtPct(x: number, digits = 1) {
  if (Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}

export function fmtNum(x: number, digits = 2) {
  if (Number.isNaN(x)) return "—";
  if (x === Infinity) return "∞";
  return x.toFixed(digits);
}
