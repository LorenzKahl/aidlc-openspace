# Unit-Test-Anleitung – Trinkgeld-CLI

Teststrategie: Minimal (Express). Ein verifizierbarer Test je Anforderung, mindestens ein Happy-Path-Test je Komponente; ca. 15 Tests insgesamt.

## Test-Framework und Setup

- Framework: `vitest` (Dev-Abhängigkeit), Konfiguration in `vitest.config.ts` (Umgebung `node`, Dateimuster `test/**/*.test.ts`).
- Voraussetzungen: Node.js LTS (≥ 20), einmalig `npm install` im Projekt-Root.
- Keine Netzwerkzugriffe, keine externen Dienste, keine Testdatenbank.

## Befehle (je Testdatei, ohne Gesamtlauf)

Jeder Befehl ist auf genau eine Testdatei begrenzt und vor dem ersten Test lauffähig (Runner wird in Plan-Schritt 2 aufgesetzt):

- Berechnung: `npx vitest run test/calc.test.ts`
- Format/Parsing: `npx vitest run test/format.test.ts`
- Sprüche: `npx vitest run test/phrases.test.ts`
- CLI: `npx vitest run test/cli.test.ts`

## Erwartete Abdeckung

| Datei | Prüft | Anforderungen |
|-------|-------|---------------|
| `test/calc.test.ts` | Standardlauf 48,50 € → 4,85 € / 53,35 €; `people 3` → 17,78 €; `round` → 54,00 € / 5,50 €; Stufe high = 15 %; `percent` + Stufe → Fehler; negativer Betrag/ungültige Personenzahl → Fehler; `people 0` → `runaway` | FR1, FR2, FR3, FR4, FR7.1, FR8.1 |
| `test/format.test.ts` | `12,34 €`-Format; Komma und Punkt als Eingabe; ungültige Eingabe → Fehler | FR5.3, FR6.1 |
| `test/phrases.test.ts` | Spruch stammt aus der Liste; Ausgabe endet mit Emoji; Scherz-Hinweis enthält „Beine in die Hand" | FR6.2, FR6.3, FR8.3 |
| `test/cli.test.ts` | Standardlauf, interaktiver Modus, `--help`, Fehler → Exit-Code 1 auf stderr, `--people 0` → Exit-Code 0, Emoji am Ende; interaktive Rundungsfrage (aufrunden → 54,00 € / 5,50 €, nicht runden → 53,35 €, ungültige Antwort → Exit-Code 1, Betrag per Argument → keine Frage) | FR3, FR5, FR6, FR7, FR8 |

Ein Coverage-Zielwert ist für Express nicht vorgegeben; die Anforderungsabdeckung ist maßgeblich.

## Mocking und Stubbing

- Zufall (Spruch-/Emoji-Auswahl) wird als Funktion `random: () => number` injiziert; Tests übergeben einen festen Wert.
- Ein-/Ausgabe der CLI läuft über ein `io`-Objekt (`stdout`, `stderr`, `prompt`); Tests übergeben Sammel-Funktionen und vorbereitete Antworten für den interaktiven Modus.
- Es wird nichts im Dateisystem gemockt, da die CLI keine Dateien liest oder schreibt.

## Testdaten

- Feste Beispielwerte im Testcode (48,50 € als Referenzrechnung), keine externen Fixtures.
- Erwartete Zeichenketten verwenden das Format `12,34 €` mit einem normalen Leerzeichen vor dem €-Zeichen.
