import { fmtPct, type Counts, type Metrics } from "./diagnostic";

/** Contextual tips Dra. Lechuza says about the current study. */
export function labMessages(c: Counts, m: Metrics): string[] {
  if (m.total === 0) return ["La tabla está vacía. Escribe algunos pacientes en las casillas o mueve los controles."];
  const out: string[] = [];
  if (m.testPos > 0) {
    out.push(
      `De los ${m.testPos} pacientes con prueba positiva, sólo ${c.tp} están realmente enfermos. Por eso el VPP es ${fmtPct(m.ppv)}.`,
    );
  }
  if (m.prevalence < 0.05 && m.ppv < 0.5) {
    out.push(
      "¡Fíjate! Con una enfermedad tan rara, aunque la prueba sea buena, la mayoría de los positivos son falsos. Es el efecto de la prevalencia.",
    );
  }
  if (m.sens >= 0.95) {
    out.push("Con una sensibilidad tan alta, un resultado negativo casi descarta la enfermedad (SnNout).");
  }
  if (m.spec >= 0.95) {
    out.push("Con una especificidad tan alta, un resultado positivo casi confirma la enfermedad (SpPin).");
  }
  if (m.sens < 0.6 && m.sick > 0) {
    out.push(`Ojo: ${c.fn} enfermos salieron negativos. Una sensibilidad baja deja escapar muchos casos.`);
  }
  out.push("Prueba a bajar la prevalencia sin tocar la sensibilidad ni la especificidad, y mira qué pasa con el VPP.");
  return out;
}
