import { describe, expect, it } from "vitest";
import { InputError } from "../src/calc.js";
import { formatEuro, parseAmount, parseNumber } from "../src/format.js";

describe("formatEuro", () => {
  it("FR6.1: Format 12,34 € mit Dezimalkomma", () => {
    expect(formatEuro(12.34)).toBe("12,34 €");
    expect(formatEuro(5)).toBe("5,00 €");
  });

  it("FR6.1: Tausendertrenner und Randwert 0", () => {
    expect(formatEuro(1234567.8)).toBe("1.234.567,80 €");
    expect(formatEuro(0)).toBe("0,00 €");
  });
});

describe("parseAmount", () => {
  it("FR5.3: Dezimalkomma und Dezimalpunkt werden akzeptiert", () => {
    expect(parseAmount("48,50")).toBe(48.5);
    expect(parseAmount("48.50")).toBe(48.5);
    expect(parseAmount(" 20 ")).toBe(20);
  });

  it("FR7.1: ungültige Eingabe -> deutscher Fehler", () => {
    expect(() => parseAmount("abc")).toThrow(InputError);
    expect(() => parseAmount("")).toThrow(/keine gültige Zahl/);
    expect(() => parseAmount("1,2,3")).toThrow(InputError);
  });

  it("parseNumber nennt das Feld in der Meldung", () => {
    expect(() => parseNumber("x", "Der Prozentsatz")).toThrow(/Der Prozentsatz/);
  });
});
