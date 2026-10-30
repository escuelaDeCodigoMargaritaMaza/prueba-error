import { describe, expect, it } from "vitest";
import {
  binormalAuc,
  countsFromParams,
  metrics,
  npvAt,
  postTestProbability,
  ppvAt,
} from "./diagnostic";

describe("métricas de la tabla 2x2", () => {
  const c = { tp: 90, fn: 10, fp: 180, tn: 720 };
  const m = metrics(c);

  it("sensibilidad = VP / (VP + FN)", () => expect(m.sens).toBeCloseTo(0.9));
  it("especificidad = VN / (VN + FP)", () => expect(m.spec).toBeCloseTo(0.8));
  it("VPP = VP / (VP + FP)", () => expect(m.ppv).toBeCloseTo(90 / 270));
  it("VPN = VN / (VN + FN)", () => expect(m.npv).toBeCloseTo(720 / 730));
  it("LR+ = sens / (1 − esp)", () => expect(m.lrPos).toBeCloseTo(4.5));
  it("LR− = (1 − sens) / esp", () => expect(m.lrNeg).toBeCloseTo(0.125));
  it("prevalencia = enfermos / total", () => expect(m.prevalence).toBeCloseTo(0.1));
});

describe("construcción desde parámetros", () => {
  it("1000 pacientes, 10% prevalencia, sens 90%, esp 80%", () => {
    expect(countsFromParams(1000, 0.1, 0.9, 0.8)).toEqual({ tp: 90, fn: 10, tn: 720, fp: 180 });
  });
});

describe("Bayes", () => {
  it("probabilidad post-prueba con pre 10% y LR 4.5", () => {
    // odds 1/9 × 4.5 = 0.5 → 0.5/1.5
    expect(postTestProbability(0.1, 4.5)).toBeCloseTo(1 / 3);
  });
  it("VPP por prevalencia coincide con la tabla", () => {
    expect(ppvAt(0.1, 0.9, 0.8)).toBeCloseTo(1 / 3);
    expect(npvAt(0.1, 0.9, 0.8)).toBeCloseTo(720 / 730);
  });
});

describe("ROC binormal", () => {
  it("AUC = 0.5 sin separación", () => expect(binormalAuc(0)).toBeCloseTo(0.5));
  it("AUC ≈ 0.76 con separación 1", () => expect(binormalAuc(1)).toBeCloseTo(0.76, 2));
});
