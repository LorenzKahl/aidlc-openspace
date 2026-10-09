# Testergebnisse – Trinkgeld-CLI

## Build

- `npm ci`: erfolgreich, 0 Schwachstellen (`npm audit --omit=dev`: 0).
- `npm run build`: erfolgreich (`tsc`, keine Fehler). `dist/bin.js` beginnt mit dem Shebang `#!/usr/bin/env node`.

## Unit-Tests (je Datei, jeweils einmal ausgeführt)

| Befehl | Gesamt | Bestanden | Fehlgeschlagen | Übersprungen |
|--------|--------|-----------|----------------|--------------|
| `npx vitest run test/calc.test.ts` | 14 | 14 | 0 | 0 |
| `npx vitest run test/format.test.ts` | 5 | 5 | 0 | 0 |
| `npx vitest run test/phrases.test.ts` | 5 | 5 | 0 | 0 |
| `npx vitest run test/cli.test.ts` | 17 | 17 | 0 | 0 |
| **Summe** | **41** | **41** | **0** | **0** |

Ein Coverage-Bericht wurde nicht erhoben; für Express/Minimal ist kein Zielwert vorgegeben.

## Rauchtests

- `node dist/bin.js 48,50`: 4,85 € Trinkgeld, 53,35 € gesamt, Exit 0, endet mit Emoji.
- Laufzeit `node dist/bin.js 48,50`: 0,13 s (Ziel NFR2: < 0,5 s).
- Interaktiv per Pipe (`printf '48,50\n\n\naufrunden\n' | node dist/bin.js`): 5,50 € Trinkgeld, 54,00 € gesamt, Exit 0.

## Fehlerdetails

Keine.
