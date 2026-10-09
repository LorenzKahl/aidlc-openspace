// CLI-Schicht: Argument-Parsing, interaktiver Modus, Ausgabe, Exit-Codes.
// Ein-/Ausgabe läuft über das `io`-Objekt, damit Tests sie ersetzen können (NFR3).

import { parseArgs } from "node:util";
import { createInterface } from "node:readline/promises";
import { computeTip, InputError, TIER_PERCENT, type Tier } from "./calc.js";
import { formatEuro, parseAmount, parseNumber } from "./format.js";
import { closingLine, runawayLine } from "./phrases.js";

export interface Io {
  stdout(text: string): void;
  stderr(text: string): void;
  /** Stellt eine Frage und liefert die Antwort (interaktiver Modus). */
  prompt(question: string): Promise<string>;
}

export const HELP_TEXT = `Trinkgeld-CLI – Trinkgeld berechnen, Rechnung aufteilen, aufrunden

Aufruf:
  tip [Betrag] [Optionen]

Optionen:
  --percent <zahl>    Trinkgeld in Prozent (Standard: 10)
  --tier <stufe>      Vordefinierte Stufe: low (5 %), normal (10 %), high (15 %)
                      (nicht zusammen mit --percent)
  --people <zahl>     Rechnung auf mehrere Personen aufteilen (Standard: 1)
  --round             Auf den nächsten vollen Euro aufrunden (pro Person bei --people)
  --help              Diese Hilfe anzeigen

Beträge dürfen mit Komma oder Punkt eingegeben werden (z. B. 48,50 oder 48.50).
Ohne Betrag startet der interaktive Modus und fragt die Werte ab, auch ob
auf den vollen Euro aufgerundet werden soll (aufrunden / nicht runden).
Mit Betrag entscheidet allein --round.

Beispiele:
  tip 48,50
  tip 48,50 --tier high --people 3
  tip 48,50 --round
`;

const VALUE_OPTIONS = new Set(["--percent", "--tier", "--people"]);
const NEGATIVE_NUMBER = /^-\d+([.,]\d+)?$/;

/**
 * node:util.parseArgs behandelt `-1` als Option. Damit `--people -1` und ein
 * negativer Betrag eine verständliche Fehlermeldung statt eines Parser-Fehlers
 * ergeben, werden solche Tokens vorab als Wert bzw. Positionsargument umgeschrieben.
 */
function normalizeArgs(argv: string[]): { args: string[]; negatives: string[] } {
  const args: string[] = [];
  const negatives: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const next = argv[i + 1];
    if (VALUE_OPTIONS.has(token) && next !== undefined && NEGATIVE_NUMBER.test(next)) {
      args.push(`${token}=${next}`);
      i++;
    } else if (NEGATIVE_NUMBER.test(token)) {
      negatives.push(token);
    } else {
      args.push(token);
    }
  }
  return { args, negatives };
}

function parseTier(text: string): Tier {
  const value = text.trim().toLowerCase();
  if (value in TIER_PERCENT) return value as Tier;
  throw new InputError(`Unbekannte Stufe „${text}". Erlaubt sind: low, normal, high.`);
}

function parsePeople(text: string): number {
  const value = parseNumber(text, "Die Personenzahl");
  if (!Number.isInteger(value)) {
    throw new InputError("Die Personenzahl muss eine ganze Zahl sein.");
  }
  return value;
}

/**
 * Wertet die Antwort auf die Rundungsfrage aus (interaktiver Modus).
 * Aufrunden: aufrunden, a, j, ja. Nicht runden: nicht runden, n, nein, leere Eingabe.
 * Abrunden gibt es bewusst nicht.
 */
function parseRoundAnswer(text: string): boolean {
  const value = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (["aufrunden", "a", "j", "ja"].includes(value)) return true;
  if (["", "nicht runden", "n", "nein"].includes(value)) return false;
  throw new InputError(
    `Unbekannte Antwort „${text.trim()}". Erlaubt sind: aufrunden oder nicht runden.`,
  );
}

function formatPercent(percent: number): string {
  return String(percent).replace(".", ",");
}

/** Führt die CLI aus und liefert den Exit-Code (0 = Erfolg, 1 = Fehler). */
export async function run(
  argv: string[],
  io: Io,
  random: () => number = Math.random,
): Promise<number> {
  try {
    const { args, negatives } = normalizeArgs(argv);
    const { values, positionals } = parseArgs({
      args,
      allowPositionals: true,
      strict: true,
      options: {
        percent: { type: "string" },
        tier: { type: "string" },
        people: { type: "string" },
        round: { type: "boolean", default: false },
        help: { type: "boolean", default: false },
      },
    });

    if (values.help) {
      io.stdout(HELP_TEXT);
      return 0;
    }

    const allPositionals = [...positionals, ...negatives];
    if (allPositionals.length > 1) {
      throw new InputError("Es darf nur ein Rechnungsbetrag angegeben werden.");
    }
    if (values.percent !== undefined && values.tier !== undefined) {
      throw new InputError("Bitte entweder --percent oder --tier angeben, nicht beides.");
    }

    let percent = values.percent !== undefined
      ? parseNumber(values.percent, "Der Prozentsatz")
      : undefined;
    let tier = values.tier !== undefined ? parseTier(values.tier) : undefined;
    let people = values.people !== undefined ? parsePeople(values.people) : undefined;

    // FR5.2: fehlt der Betrag, werden die fehlenden Werte interaktiv abgefragt.
    let round = values.round;
    let amountText = allPositionals[0];
    if (amountText === undefined) {
      amountText = await io.prompt("Rechnungsbetrag (z. B. 48,50): ");
      if (percent === undefined && tier === undefined) {
        const answer = (
          await io.prompt("Trinkgeld in Prozent oder Stufe low/normal/high [Enter = 10 %]: ")
        ).trim();
        if (answer !== "") {
          if (/^[a-zA-Z]+$/.test(answer)) tier = parseTier(answer);
          else percent = parseNumber(answer, "Der Prozentsatz");
        }
      }
      if (people === undefined) {
        const answer = (await io.prompt("Anzahl Personen [Enter = 1]: ")).trim();
        if (answer !== "") people = parsePeople(answer);
      }
      // Änderungswunsch: Rundungsfrage nur im interaktiven Modus und nur, wenn --round fehlt.
      if (!round) {
        round = parseRoundAnswer(
          await io.prompt("Auf den nächsten vollen Euro aufrunden? (aufrunden / nicht runden) [Enter = nicht runden]: "),
        );
      }
    }

    const amount = parseAmount(amountText);
    const result = computeTip({ amount, percent, tier, people, round });

    if (result.kind === "runaway") {
      io.stdout(`${runawayLine(random)}\n`);
      return 0;
    }

    const lines = [
      `Rechnung:  ${formatEuro(result.bill)}`,
      `Trinkgeld: ${formatEuro(result.tip)} (${formatPercent(result.percent)} %)`,
      `Gesamt:    ${formatEuro(result.total)}`,
    ];
    if (result.people > 1) {
      lines.push(`Pro Person (${result.people}): ${formatEuro(result.perPerson)}`);
    }
    lines.push("", closingLine(random));
    io.stdout(`${lines.join("\n")}\n`);
    return 0;
  } catch (error) {
    // Erwartete Eingabefehler und Parser-Fehler (unbekannte Option etc.) -> stderr, Exit-Code 1.
    const message = error instanceof Error ? error.message : String(error);
    io.stderr(`Fehler: ${message}\nMit --help werden alle Optionen angezeigt.\n`);
    return 1;
  }
}

/** Echte Ein-/Ausgabe für den Betrieb über Terminal bzw. Pipe. */
export function createDefaultIo(): Io & { close(): void } {
  let rl: ReturnType<typeof createInterface> | undefined;
  const lines: string[] = [];
  const waiters: Array<{ resolve(line: string): void; reject(error: Error): void }> = [];
  let ended = false;

  // Eine einzige readline-Instanz, damit bei Pipes keine Zeilen verloren gehen.
  function ensure(): void {
    if (rl) return;
    rl = createInterface({ input: process.stdin });
    rl.on("line", (line) => {
      const waiter = waiters.shift();
      if (waiter) waiter.resolve(line);
      else lines.push(line);
    });
    rl.on("close", () => {
      ended = true;
      for (const waiter of waiters.splice(0)) {
        waiter.reject(new InputError("Die Eingabe wurde beendet."));
      }
    });
  }

  return {
    stdout: (text) => {
      process.stdout.write(text);
    },
    stderr: (text) => {
      process.stderr.write(text);
    },
    prompt: (question) => {
      ensure();
      process.stdout.write(question);
      const queued = lines.shift();
      if (queued !== undefined) return Promise.resolve(queued);
      if (ended) return Promise.reject(new InputError("Die Eingabe wurde beendet."));
      return new Promise<string>((resolve, reject) => waiters.push({ resolve, reject }));
    },
    close: () => rl?.close(),
  };
}
