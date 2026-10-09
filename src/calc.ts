// Reine Berechnungslogik des Trinkgeld-CLI (keine Ein-/Ausgabe, NFR3).
// Alle Geldbeträge werden intern in Cent (ganze Zahlen) gerechnet, um
// Gleitkomma-Fehler zu vermeiden (FR1.3).

export type Tier = "low" | "normal" | "high";

/** Vordefinierte Stufen in Prozent (FR4.1). */
export const TIER_PERCENT: Record<Tier, number> = {
  low: 5,
  normal: 10,
  high: 15,
};

/** Standard-Prozentsatz, wenn weder --percent noch --tier angegeben sind (FR1.2). */
export const DEFAULT_PERCENT = 10;

/** Fehler für ungültige Eingaben; die Meldung ist bereits deutsch (FR7.1). */
export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

export interface TipInput {
  /** Rechnungsbetrag in Euro. */
  amount: number;
  /** Trinkgeld-Prozentsatz; schließt sich mit `tier` aus (FR4.2). */
  percent?: number;
  tier?: Tier;
  /** Anzahl Personen, Standard 1. 0 ergibt den Scherz-Fall (FR8.1). */
  people?: number;
  /** Aufrunden auf den nächsten vollen Euro (pro Person bei mehreren Personen). */
  round?: boolean;
}

export interface TipResult {
  kind: "result";
  percent: number;
  people: number;
  /** Rechnungsbetrag in Euro. */
  bill: number;
  /** Trinkgeld in Euro (nach evtl. Aufrunden). */
  tip: number;
  /** Gesamtbetrag in Euro (nach evtl. Aufrunden). */
  total: number;
  /** Betrag pro Person in Euro. */
  perPerson: number;
}

/** Scherz-Fall bei 0 Personen: es wird nichts berechnet (FR8.1). */
export interface RunawayResult {
  kind: "runaway";
}

/** Kaufmännisches Runden (halb auf), mit kleiner Toleranz gegen Gleitkomma-Rauschen. */
function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5 + 1e-9);
}

/** Aufrunden mit Toleranz gegen Gleitkomma-Rauschen. */
function ceilSafe(value: number): number {
  return Math.ceil(value - 1e-9);
}

export function computeTip(input: TipInput): TipResult | RunawayResult {
  const { amount, percent, tier, round = false } = input;
  const people = input.people ?? 1;

  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    throw new InputError("Der Rechnungsbetrag muss eine Zahl sein.");
  }
  if (amount < 0) {
    throw new InputError("Der Rechnungsbetrag darf nicht negativ sein.");
  }
  if (percent !== undefined && tier !== undefined) {
    throw new InputError(
      "Bitte entweder --percent oder --tier angeben, nicht beides.",
    );
  }
  if (percent !== undefined && (!Number.isFinite(percent) || percent < 0)) {
    throw new InputError("Der Prozentsatz muss eine Zahl von 0 oder größer sein.");
  }
  if (tier !== undefined && !(tier in TIER_PERCENT)) {
    throw new InputError("Unbekannte Stufe. Erlaubt sind: low, normal, high.");
  }
  if (!Number.isInteger(people) || people < 0) {
    throw new InputError("Die Personenzahl muss eine ganze Zahl von 0 oder größer sein.");
  }

  // FR8.1: bei 0 Personen wird nichts berechnet.
  if (people === 0) {
    return { kind: "runaway" };
  }

  const effectivePercent =
    percent ?? (tier !== undefined ? TIER_PERCENT[tier] : DEFAULT_PERCENT);

  const billCents = roundHalfUp(amount * 100);
  const tipCents = roundHalfUp((billCents * effectivePercent) / 100);
  let totalCents = billCents + tipCents;
  let perPersonCents = roundHalfUp(totalCents / people);

  if (round) {
    // FR3.1/FR3.2: pro Person auf den nächsten vollen Euro aufrunden.
    perPersonCents = ceilSafe(totalCents / people / 100) * 100;
    totalCents = perPersonCents * people;
  }

  return {
    kind: "result",
    percent: effectivePercent,
    people,
    bill: billCents / 100,
    tip: (totalCents - billCents) / 100,
    total: totalCents / 100,
    perPerson: perPersonCents / 100,
  };
}
