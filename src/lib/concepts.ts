export const CONCEPTS = [
  { to: "/", label: "Laboratorio", short: "Laboratorio", blurb: "Construye tu propio estudio con pacientes que puedes contar." },
  {
    to: "/sensibilidad-especificidad",
    label: "Sensibilidad y especificidad",
    short: "Sens. y Esp.",
    blurb: "¿Qué tan bien detecta la prueba a los enfermos y a los sanos?",
  },
  {
    to: "/valores-predictivos",
    label: "Valores predictivos (VPP y VPN)",
    short: "VPP y VPN",
    blurb: "Si mi resultado es positivo, ¿qué probabilidad tengo de estar enfermo?",
  },
  {
    to: "/razones-de-verosimilitud",
    label: "Razones de verosimilitud (LR)",
    short: "LR",
    blurb: "Cuánto cambia un resultado la probabilidad de enfermedad.",
  },
  {
    to: "/curva-roc",
    label: "Curvas ROC",
    short: "Curva ROC",
    blurb: "Mueve el punto de corte y mira el equilibrio entre sensibilidad y especificidad.",
  },
  {
    to: "/teorema-de-bayes",
    label: "Teorema de Bayes",
    short: "Bayes",
    blurb: "Pasa de la probabilidad pre-prueba a la probabilidad post-prueba.",
  },
  {
    to: "/nomograma-de-fagan",
    label: "Nomograma de Fagan",
    short: "Nomograma",
    blurb: "(Psst... no necesitas una calculadora para aplicar Bayes).",
  },
] as const;

export type ConceptPath = (typeof CONCEPTS)[number]["to"];
