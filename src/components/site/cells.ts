import type { Cell } from "@/lib/diagnostic";

export const CELL_INFO: Record<
  Cell,
  { short: string; name: string; fill: string; soft: string; text: string; border: string; positive: boolean; sick: boolean }
> = {
  tp: {
    short: "VP",
    name: "Verdaderos positivos",
    fill: "bg-vp",
    soft: "bg-vp-soft",
    text: "text-vp",
    border: "border-vp",
    positive: true,
    sick: true,
  },
  fp: {
    short: "FP",
    name: "Falsos positivos",
    fill: "bg-fp",
    soft: "bg-fp-soft",
    text: "text-fp",
    border: "border-fp",
    positive: true,
    sick: false,
  },
  fn: {
    short: "FN",
    name: "Falsos negativos",
    fill: "bg-fn",
    soft: "bg-fn-soft",
    text: "text-fn",
    border: "border-fn",
    positive: false,
    sick: true,
  },
  tn: {
    short: "VN",
    name: "Verdaderos negativos",
    fill: "bg-vn",
    soft: "bg-vn-soft",
    text: "text-vn",
    border: "border-vn",
    positive: false,
    sick: false,
  },
};
