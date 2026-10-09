import { describe, expect, it } from "vitest";
import { computeTip, InputError, type TipResult } from "../src/calc.js";

function result(input: Parameters<typeof computeTip>[0]): TipResult {
  const r = computeTip(input);
  if (r.kind !== "result") throw new Error("Ergebnis erwartet");
  return r;
}

describe("computeTip", () => {
  it("FR1: Standardlauf 48,50 € mit 10 % -> 4,85 € Trinkgeld, 53,35 € gesamt", () => {
    const r = result({ amount: 48.5 });
    expect(r.percent).toBe(10);
    expect(r.tip).toBe(4.85);
    expect(r.total).toBe(53.35);
    expect(r.perPerson).toBe(53.35);
  });

  it("FR1.2: --percent überschreibt den Standard", () => {
    const r = result({ amount: 100, percent: 12.5 });
    expect(r.tip).toBe(12.5);
    expect(r.total).toBe(112.5);
  });

  it("FR1.3: kaufmännische Rundung auf zwei Nachkommastellen", () => {
    // 10,05 * 10 % = 1,005 -> 1,01 (halb auf)
    expect(result({ amount: 10.05 }).tip).toBe(1.01);
  });

  it("FR2: people 3 -> 17,78 € pro Person", () => {
    const r = result({ amount: 48.5, people: 3 });
    expect(r.perPerson).toBe(17.78);
    expect(r.total).toBe(53.35);
  });

  it("FR3: round -> 54,00 € gesamt, 5,50 € Trinkgeld", () => {
    const r = result({ amount: 48.5, round: true });
    expect(r.total).toBe(54);
    expect(r.tip).toBe(5.5);
  });

  it("FR3.2: round mit people rundet pro Person auf", () => {
    // 53,35 / 3 = 17,78 -> 18,00 pro Person, gesamt 54,00
    const r = result({ amount: 48.5, people: 3, round: true });
    expect(r.perPerson).toBe(18);
    expect(r.total).toBe(54);
    expect(r.tip).toBe(5.5);
  });

  it("FR3.1: ein bereits voller Euro-Betrag wird nicht weiter aufgerundet", () => {
    const r = result({ amount: 100, round: true });
    expect(r.total).toBe(110);
  });

  it("FR4: Stufen low/normal/high = 5/10/15 %", () => {
    expect(result({ amount: 100, tier: "low" }).percent).toBe(5);
    expect(result({ amount: 100, tier: "normal" }).percent).toBe(10);
    const high = result({ amount: 100, tier: "high" });
    expect(high.percent).toBe(15);
    expect(high.tip).toBe(15);
  });

  it("FR4.2: percent zusammen mit Stufe -> Fehler", () => {
    expect(() => computeTip({ amount: 10, percent: 10, tier: "low" })).toThrow(InputError);
  });

  it("FR7.1: negativer Betrag -> Fehler", () => {
    expect(() => computeTip({ amount: -1 })).toThrow(/negativ/);
  });

  it("FR7.1: nicht numerischer Betrag -> Fehler", () => {
    expect(() => computeTip({ amount: Number.NaN })).toThrow(InputError);
  });

  it("FR7.1: negativer Prozentsatz -> Fehler", () => {
    expect(() => computeTip({ amount: 10, percent: -5 })).toThrow(InputError);
  });

  it("FR7.1: negative oder gebrochene Personenzahl -> Fehler", () => {
    expect(() => computeTip({ amount: 10, people: -1 })).toThrow(InputError);
    expect(() => computeTip({ amount: 10, people: 2.5 })).toThrow(InputError);
  });

  it("FR8.1: people 0 -> runaway ohne Berechnung", () => {
    expect(computeTip({ amount: 48.5, people: 0 })).toEqual({ kind: "runaway" });
  });
});
