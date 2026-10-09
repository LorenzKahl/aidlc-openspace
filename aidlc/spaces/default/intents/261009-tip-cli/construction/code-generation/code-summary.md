# Code-Zusammenfassung – Trinkgeld-CLI

## Erstellte Dateien

- Konfiguration: `package.json` (Paket `tip-cli`, `type: module`, `bin: tip -> dist/bin.js`), `package-lock.json`, `tsconfig.json`, `vitest.config.ts`
- Quellcode: `src/calc.ts` (Berechnung), `src/format.ts` (Format/Parsing), `src/phrases.ts` (Sprüche, Emojis, Scherz-Hinweis), `src/cli.ts` (Argumente, interaktiver Modus, Ausgabe, Exit-Codes), `src/bin.ts` (Einstiegspunkt mit Shebang)
- Tests: `test/calc.test.ts`, `test/format.test.ts`, `test/phrases.test.ts`, `test/cli.test.ts`
- Dokumentation: `README.md`
- Keine Laufzeit-Abhängigkeiten; Dev-Abhängigkeiten: `typescript`, `vitest`, `@types/node`.

## Wichtige Entscheidungen

- Geldbeträge werden intern in Cent (ganze Zahlen) gerechnet; kaufmännische Rundung (halb auf) mit kleiner Toleranz gegen Gleitkomma-Rauschen.
- `--round` rundet den Betrag pro Person auf den vollen Euro auf; Gesamtbetrag = Pro-Person-Betrag × Personenzahl, Trinkgeld = Gesamtbetrag − Rechnung (48,50 € mit 3 Personen: 18,00 € pro Person, 54,00 € gesamt, 5,50 € Trinkgeld).
- `computeTip` liefert `kind: "result" | "runaway"`; bei 0 Personen wird nichts berechnet (FR8.1). Ungültige Eingaben werfen `InputError` mit deutscher Meldung.
- `node:util.parseArgs` lehnt `--people -1` und `-5` als mehrdeutige Optionen ab; `cli.ts` normalisiert solche Tokens vorab, damit die Fehlermeldung verständlich (FR7.1) statt ein Parser-Fehler ist.
- Interaktiver Modus fragt nur fehlende Werte ab; eine einzige readline-Instanz wird wiederverwendet (keine verlorenen Zeilen bei Pipes), Eingabeende (EOF) ergibt eine Fehlermeldung statt eines Hängers.
- Änderungswunsch (Plan-Schritt 13): Im interaktiven Modus (Betrag fehlt) fragt die CLI zuletzt, ob aufgerundet werden soll (`aufrunden`/`a`/`j`/`ja` oder `nicht runden`/`n`/`nein`/Enter; kein Abrunden). „aufrunden“ wirkt wie `--round`. Ungültige Antwort -> Fehler, Exit-Code 1. Bei Betrag als Argument oder bereits gesetztem `--round` keine Frage.
- Ausgabe/Eingabe laufen über das `io`-Objekt und eine injizierbare `random`-Funktion; dadurch sind alle Tests deterministisch.
- Der Scherz-Hinweis bei 0 Personen ist ausdrücklich als Scherz formuliert (FR8.3) und endet mit einem Emoji.

## Testabdeckung

Test-after gemäß Testing Contract (Strategie Minimal, kein Coverage-Zielwert für Express). Ergebnis je Datei:

| Befehl | Ergebnis |
|--------|----------|
| `npx vitest run test/calc.test.ts` | 14 bestanden |
| `npx vitest run test/format.test.ts` | 5 bestanden |
| `npx vitest run test/phrases.test.ts` | 5 bestanden |
| `npx vitest run test/cli.test.ts` | 17 bestanden |

Alle Akzeptanzkriterien sind abgedeckt: 48,50 € -> 4,85 € / 53,35 €; 3 Personen -> 17,78 €; `--round` -> 54,00 € / 5,50 €; `--tier high` = 15 %; `--people -1` -> Fehler, Exit-Code 1; `--people 0` -> Scherz-Hinweis, Exit-Code 0, endet mit Emoji. Rauchtest nach `npm run build`: `node dist/bin.js 48,50` läuft in ca. 0,03 s (NFR2 < 500 ms).

## Abweichungen vom Plan

- `.gitignore`: Die vom Framework gelieferte Datei enthält `node_modules` und `dist` bereits; sie wurde nicht verändert und steht daher nicht im Source-Manifest.
- Die Datei `src/cli.ts` enthält zusätzlich `createDefaultIo()` (echte Ein-/Ausgabe) und die Vorab-Normalisierung negativer Zahlen; beides war im Plan nicht einzeln genannt.
- Die Anforderung „Test je Anforderung“ wurde mit insgesamt 36 statt ca. 15 Tests erfüllt, weil Randfälle der Konstruktions-Leitplanken (mindestens zwei Fehler-/Randfälle je Testdatei) mit abgedeckt sind.
- Inapplicable Schichten (Datenmodell, Repository, Frontend) entfielen wie im Plan vorgesehen.
