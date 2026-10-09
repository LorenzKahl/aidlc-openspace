import { describe, expect, it } from "vitest";
import {
  closingLine,
  EMOJIS,
  PHRASES,
  pickPhrase,
  runawayLine,
} from "../src/phrases.js";

const endsWithEmoji = (text: string) => EMOJIS.some((e) => text.endsWith(e));

describe("phrases", () => {
  it("FR6.2: der Spruch stammt aus der festen Liste", () => {
    expect(PHRASES).toContain(pickPhrase(() => 0));
    expect(PHRASES).toContain(pickPhrase(() => 0.999999));
  });

  it("FR6.2: die Schlusszeile enthält den Spruch und endet mit einem Emoji", () => {
    const line = closingLine(() => 0.5);
    expect(PHRASES.some((p) => line.startsWith(p))).toBe(true);
    expect(endsWithEmoji(line)).toBe(true);
  });

  it("Randwert: random() = 1 führt nicht aus der Liste heraus", () => {
    expect(PHRASES).toContain(pickPhrase(() => 1));
  });

  it("FR8.3: der Scherz-Hinweis enthält „Beine in die Hand“, ist als Scherz gekennzeichnet und endet mit Emoji", () => {
    const line = runawayLine(() => 0);
    expect(line).toContain("Beine in die Hand");
    expect(line).toContain("Scherz");
    expect(endsWithEmoji(line)).toBe(true);
  });

  it("FR6.3: alle Sprüche sind nicht leer und enthalten keine Zeilenumbrüche", () => {
    for (const p of PHRASES) {
      expect(p.trim().length).toBeGreaterThan(0);
      expect(p).not.toMatch(/\n/);
    }
  });
});
