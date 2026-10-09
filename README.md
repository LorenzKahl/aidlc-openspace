# Trinkgeld-CLI (`tip`)

Kleine Kommandozeilenanwendung: Trinkgeld und Gesamtbetrag einer Restaurantrechnung berechnen, auf mehrere Personen aufteilen und auf volle Euro aufrunden. Die Ausgabe ist deutsch, endet mit einem freundlichen Spruch und einem Emoji.

## Voraussetzungen

- Node.js LTS (>= 20)

## Installation

```bash
npm install
npm run build
npm link          # optional: stellt den Befehl `tip` global bereit
```

Ohne `npm link` geht es auch direkt: `node dist/bin.js 48,50`.

## Verwendung

```bash
tip 48,50                         # 10 % Standard-Trinkgeld
tip 48.50 --percent 12.5          # eigener Prozentsatz
tip 48,50 --tier high             # Stufe low (5 %), normal (10 %), high (15 %)
tip 48,50 --people 3              # Betrag pro Person
tip 48,50 --round                 # auf den nächsten vollen Euro aufrunden
tip                               # interaktiver Modus: Werte werden abgefragt
tip --help                        # Hilfe auf Deutsch
```

Beispiel:

```
$ tip 48,50
Rechnung:  48,50 €
Trinkgeld: 4,85 € (10 %)
Gesamt:    53,35 €

Trinkgeld ist das Dankeschön, das man schmecken kann. 💶
```

Hinweise:

- `--percent` und `--tier` schließen sich aus.
- `--round` zusammen mit `--people` rundet den Betrag pro Person auf.
- Ungültige Eingaben ergeben eine Fehlermeldung auf stderr und Exit-Code 1.
- Im interaktiven Modus (ohne Betrag) fragt die CLI bei jedem Lauf zusätzlich, ob auf den nächsten vollen Euro aufgerundet werden soll. Antworten: `aufrunden` (auch `a`, `j`, `ja`) oder `nicht runden` (auch `n`, `nein`; Enter = nicht runden). „aufrunden“ wirkt wie `--round`. Eine andere Antwort ergibt eine Fehlermeldung und Exit-Code 1. Wurde `--round` schon angegeben, wird nicht erneut gefragt; Abrunden gibt es nicht.
- Wird der Betrag als Argument übergeben, entscheidet allein `--round`; es erscheint keine Rundungsfrage.
- `--people 0` ist ein Scherz-Hinweis (Exit-Code 0), keine Berechnung.

## Entwicklung und Tests

```bash
npm install
npx vitest run test/calc.test.ts     # Berechnung
npx vitest run test/format.test.ts   # Format/Parsing
npx vitest run test/phrases.test.ts  # Sprüche
npx vitest run test/cli.test.ts      # CLI
npm run build                        # TypeScript nach dist/
```

Die Anwendung hat keine Laufzeit-Abhängigkeiten, greift nicht auf das Netzwerk zu und speichert keine Daten.
