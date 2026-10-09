// Formatierung und Parsing von Beträgen (FR5.3, FR6.1).

import { InputError } from "./calc.js";

/** Formatiert einen Eurobetrag als `12,34 €` (Dezimalkomma, Tausenderpunkt). */
export function formatEuro(value: number): string {
  const negative = value < 0;
  const [whole, fraction] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${grouped},${fraction} €`;
}

/**
 * Liest eine Dezimalzahl mit Komma oder Punkt als Trenner (z. B. `48,50`).
 * `label` benennt das Feld in der deutschen Fehlermeldung.
 */
export function parseNumber(text: string, label = "Wert"): number {
  const trimmed = text.trim();
  if (!/^-?\d+([.,]\d+)?$/.test(trimmed)) {
    throw new InputError(`${label} „${text}" ist keine gültige Zahl.`);
  }
  return Number(trimmed.replace(",", "."));
}

/** Liest einen Rechnungsbetrag (Komma oder Punkt). */
export function parseAmount(text: string): number {
  return parseNumber(text, "Der Rechnungsbetrag");
}
