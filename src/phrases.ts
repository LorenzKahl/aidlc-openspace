// Freundliche Sprüche, Emojis und der Scherz-Hinweis (FR6.2, FR6.3, FR8.1, FR8.3).

/** Feste Liste harmloser, freundlicher Sprüche rund um Bedienung und Trinkgeld. */
export const PHRASES: readonly string[] = [
  "Gutes Trinkgeld macht den Tag der Bedienung heller.",
  "Wer freundlich bedient wird, gibt gern ein bisschen mehr.",
  "Ein Lächeln und ein Trinkgeld – die beste Kombination am Tisch.",
  "Die Küche hat gezaubert, die Bedienung hat gesprintet – danke dafür!",
  "Trinkgeld ist das Dankeschön, das man schmecken kann.",
  "Aber nicht alles auf einmal ausgeben.",
];

/** Emojis; jedes besteht aus genau einem Zeichen (Codepoint), damit es sicher am Ende steht. */
export const EMOJIS: readonly string[] = ["😊", "🎉", "👍", "🙏", "💶", "🍀"];

/** Scherz-Hinweis bei 0 Personen – ausdrücklich nicht ernst gemeint (FR8.3). */
export const RUNAWAY_TEXT =
  "Null Personen? Dann nimm die Beine in die Hand und renn los, um die Zeche zu prellen – " +
  "war natürlich nur ein Scherz, wir zahlen selbstverständlich immer brav!";

/** Wählt per `random()` (Wert in [0, 1)) ein Element der Liste aus. */
function pick<T>(items: readonly T[], random: () => number): T {
  const index = Math.min(items.length - 1, Math.floor(random() * items.length));
  return items[Math.max(0, index)];
}

export function pickPhrase(random: () => number = Math.random): string {
  return pick(PHRASES, random);
}

export function pickEmoji(random: () => number = Math.random): string {
  return pick(EMOJIS, random);
}

/** Schlusszeile einer erfolgreichen Ausgabe: Spruch, am Ende ein Emoji (FR6.2). */
export function closingLine(random: () => number = Math.random): string {
  return `${pickPhrase(random)} ${pickEmoji(random)}`;
}

/** Scherz-Hinweis für 0 Personen, endet mit einem Emoji (FR8.1). */
export function runawayLine(random: () => number = Math.random): string {
  return `${RUNAWAY_TEXT} ${pickEmoji(random)}`;
}
