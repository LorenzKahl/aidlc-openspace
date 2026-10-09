import { describe, expect, it } from "vitest";
import { HELP_TEXT, run, type Io } from "../src/cli.js";
import { EMOJIS, PHRASES } from "../src/phrases.js";

function makeIo(answers: string[] = []) {
  const out: string[] = [];
  const err: string[] = [];
  const questions: string[] = [];
  const queue = [...answers];
  const io: Io = {
    stdout: (t) => out.push(t),
    stderr: (t) => err.push(t),
    prompt: async (q) => {
      questions.push(q);
      const a = queue.shift();
      if (a === undefined) throw new Error("keine Antwort vorbereitet");
      return a;
    },
  };
  return { io, out: () => out.join(""), err: () => err.join(""), questions };
}

const lastChars = (text: string) => text.trimEnd();
const endsWithEmoji = (text: string) => EMOJIS.some((e) => lastChars(text).endsWith(e));

describe("run", () => {
  it("FR1/FR6: Standardlauf mit Komma-Eingabe, Exit-Code 0, Spruch und Emoji am Ende", async () => {
    const t = makeIo();
    const code = await run(["48,50"], t.io, () => 0);
    expect(code).toBe(0);
    expect(t.out()).toContain("4,85 €");
    expect(t.out()).toContain("53,35 €");
    expect(t.out()).toContain(PHRASES[0]);
    expect(endsWithEmoji(t.out())).toBe(true);
    expect(t.err()).toBe("");
  });

  it("FR2/FR3: --people 3 und --round zusammen", async () => {
    const t = makeIo();
    expect(await run(["48.50", "--people", "3"], t.io)).toBe(0);
    expect(t.out()).toContain("Pro Person (3): 17,78 €");
    const r = makeIo();
    expect(await run(["48,50", "--round"], r.io)).toBe(0);
    expect(r.out()).toContain("54,00 €");
    expect(r.out()).toContain("5,50 €");
  });

  it("FR4: --tier high rechnet mit 15 %", async () => {
    const t = makeIo();
    expect(await run(["100", "--tier", "high"], t.io)).toBe(0);
    expect(t.out()).toContain("15,00 €");
    expect(t.out()).toContain("(15 %)");
  });

  it("FR5.2: ohne Betrag startet der interaktive Modus", async () => {
    const t = makeIo(["48,50", "high", "3", ""]);
    expect(await run([], t.io)).toBe(0);
    expect(t.questions).toHaveLength(4);
    expect(t.out()).toContain("Pro Person (3):");
    expect(t.out()).toContain("(15 %)");
    expect(endsWithEmoji(t.out())).toBe(true);
  });

  it("FR5.2: im interaktiven Modus fragt nur fehlende Werte ab", async () => {
    const t = makeIo(["20", ""]);
    expect(await run(["--percent", "10", "--people", "2"], t.io)).toBe(0);
    expect(t.questions).toHaveLength(2);
  });

  it("FR5.4: --help zeigt die deutsche Hilfe, Exit-Code 0", async () => {
    const t = makeIo();
    expect(await run(["--help"], t.io)).toBe(0);
    expect(t.out()).toBe(HELP_TEXT);
    expect(t.out()).toContain("--percent");
    expect(t.out()).toContain("--round");
  });

  it("FR7.1: --people -1 -> Fehlermeldung auf stderr, Exit-Code 1, nichts auf stdout", async () => {
    const t = makeIo();
    expect(await run(["48,50", "--people", "-1"], t.io)).toBe(1);
    expect(t.err()).toContain("Fehler:");
    expect(t.err()).toContain("Personenzahl");
    expect(t.out()).toBe("");
  });

  it("FR7.1: nicht numerischer und negativer Betrag -> Exit-Code 1", async () => {
    const a = makeIo();
    expect(await run(["abc"], a.io)).toBe(1);
    expect(a.err()).toContain("keine gültige Zahl");
    const b = makeIo();
    expect(await run(["-5"], b.io)).toBe(1);
    expect(b.err()).toContain("negativ");
  });

  it("FR4.2: --percent zusammen mit --tier -> Fehler", async () => {
    const t = makeIo();
    expect(await run(["10", "--percent", "10", "--tier", "low"], t.io)).toBe(1);
    expect(t.err()).toContain("--percent");
  });

  it("FR7.1: unbekannte Option und gebrochene Personenzahl -> Exit-Code 1", async () => {
    const a = makeIo();
    expect(await run(["10", "--foo"], a.io)).toBe(1);
    const b = makeIo();
    expect(await run(["10", "--people", "2,5"], b.io)).toBe(1);
  });

  it("FR8: --people 0 -> Scherz-Hinweis auf stdout, Exit-Code 0, endet mit Emoji", async () => {
    const t = makeIo();
    expect(await run(["48,50", "--people", "0"], t.io)).toBe(0);
    expect(t.out()).toContain("Beine in die Hand");
    expect(t.out()).not.toContain("Trinkgeld:");
    expect(endsWithEmoji(t.out())).toBe(true);
    expect(t.err()).toBe("");
  });

  it("FR8.1: 0 Personen auch im interaktiven Modus", async () => {
    const t = makeIo(["48,50", "", "0", ""]);
    expect(await run([], t.io)).toBe(0);
    expect(t.out()).toContain("Beine in die Hand");
  });

  it("FR3/FR5.2 [change-request]: interaktiv + aufrunden -> 54,00 € gesamt, 5,50 € Trinkgeld", async () => {
    const t = makeIo(["48,50", "", "", "aufrunden"]);
    expect(await run([], t.io)).toBe(0);
    expect(t.questions).toHaveLength(4);
    expect(t.questions[3]).toContain("aufrunden");
    expect(t.out()).toContain("5,50 €");
    expect(t.out()).toContain("54,00 €");
  });

  it("FR5.2 [change-request]: interaktiv + nicht runden / Enter -> 53,35 €", async () => {
    for (const answer of ["nicht runden", "", "n", "nein"]) {
      const t = makeIo(["48,50", "", "", answer]);
      expect(await run([], t.io)).toBe(0);
      expect(t.out()).toContain("53,35 €");
    }
  });

  it("FR3.2 [change-request]: interaktiv + aufrunden mit mehreren Personen rundet pro Person", async () => {
    const t = makeIo(["48,50", "", "3", "ja"]);
    expect(await run([], t.io)).toBe(0);
    expect(t.out()).toContain("54,00 €");
    expect(t.out()).toContain("18,00 €");
  });

  it("FR7.1 [change-request]: ungültige Rundungsantwort -> Fehler auf stderr, Exit-Code 1", async () => {
    const t = makeIo(["48,50", "", "", "abrunden"]);
    expect(await run([], t.io)).toBe(1);
    expect(t.err()).toContain("Fehler:");
    expect(t.err()).toContain("abrunden");
    expect(t.out()).toBe("");
  });

  it("FR5.2 [change-request]: Betrag als Argument -> keine Rundungsfrage; --round bei fehlendem Betrag -> keine erneute Frage", async () => {
    const a = makeIo();
    expect(await run(["48,50"], a.io)).toBe(0);
    expect(a.questions).toHaveLength(0);
    expect(a.out()).toContain("53,35 €");
    const b = makeIo(["48,50", "", ""]);
    expect(await run(["--round"], b.io)).toBe(0);
    expect(b.questions).toHaveLength(3);
    expect(b.out()).toContain("54,00 €");
  });
});
