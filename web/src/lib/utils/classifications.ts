export const CLASSIFICATION_COLORS: Record<string, string> = {
  brilliant: "#21B1E0",
  great: "#2ECC71",
  best: "#2ECC71",
  excellent: "#2ECC71",
  good: "#9B59B6",
  inaccuracy: "#F1C40F",
  mistake: "#E67E22",
  blunder: "#E74C3C",
};

export const CLASSIFICATION_SYMBOLS: Record<string, string> = {
  brilliant: "!!",
  great: "!",
  best: "",
  excellent: "",
  good: "",
  inaccuracy: "?!",
  mistake: "?",
  blunder: "??",
};

export function getClassificationColor(classification: string): string {
  return CLASSIFICATION_COLORS[classification] ?? "#6B6B6B";
}

export function getClassificationSymbol(classification: string): string {
  return CLASSIFICATION_SYMBOLS[classification] ?? "";
}
