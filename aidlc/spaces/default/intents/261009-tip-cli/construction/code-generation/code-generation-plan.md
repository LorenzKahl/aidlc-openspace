# Code Generation Plan – Trinkgeld-CLI

Zero-Unit-Lauf (Express): eine Implementierungsiteration, Artefakte unter `construction/code-generation/`. Anwendungscode liegt im Workspace-Root.

## Überblick

- **Technik:** Node.js (LTS) + TypeScript, ESM, npm-Paket mit `bin`-Eintrag `tip` (NFR1).
- **Laufzeit-Abhängigkeiten:** keine. Argument-Parsing mit `node:util.parseArgs`, interaktiver Modus mit `node:readline/promises`.
- **Dev-Abhängigkeiten:** `typescript`, `vitest`, `@types/node`.
- **Komponenten (Dateien unter `src/`):**
  - `calc.ts` – reine Berechnungslogik (Trinkgeld, Aufteilen, Aufrunden, Stufen, Validierung)
  - `format.ts` – Beträge im Format `12,34 €`, Parsing von Komma/Punkt-Eingaben
  - `phrases.ts` – feste Liste freundlicher Sprüche und Emojis, 0-Personen-Scherz
  - `cli.ts` – Argument-Parsing, interaktiver Modus, Ausgabe, Exit-Codes
  - `bin.ts` – Einstiegspunkt (Shebang), ruft `cli.ts` auf
- **Tests:** `test/*.test.ts` mit vitest, ein Test je Anforderung (Express/Minimal) plus Happy-Path je Komponente.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "express",
  "test_strategy": "minimal",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    }
  ],
  "obligations": {
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:6cb23162168334768ff8f29699669845616670119c9eb58bf9bb05af6fefd3de",
  "contract_sha256": "sha256:283a836cf0757ed2efa4b5dd3135f3986eb59880b3017f4ba87a685cfebedfdb"
}
```

Inapplicable Schichten (keine Datenbank, kein Repository, kein Frontend) entfallen; die übrigen Schritte folgen der Test-after-Reihenfolge des Vertrags.

## Schritte

- [x] **Step 1 – Projektgerüst und Produktionskonfiguration.** `package.json` (Name `tip-cli`, `type: module`, `bin: { tip: dist/bin.js }`, Skripte `build`, `test`), `tsconfig.json`, `.gitignore` (`node_modules`, `dist`). Rückverfolgung: NFR1.
- [x] **Step 2 – Test-Runner bootstrappen.** `vitest.config.ts`, Dev-Abhängigkeiten installieren; unit-scoped Befehl: `npx vitest run test/calc.test.ts` (je Datei analog). Rückverfolgung: NFR3.
- [x] **Step 3 – Business-Logik implementieren (`src/calc.ts`).** `computeTip({ amount, percent, tier, people, round })`: Standard 10 %, Stufen low/normal/high = 5/10/15 %, Konflikt `--percent` + Stufe, kaufmännische Rundung auf 2 Stellen, Aufteilen, Aufrunden pro Person bzw. gesamt, Rückgabe `kind: "result" | "runaway"` für 0 Personen. Rückverfolgung: FR1.1–FR1.3, FR2.1, FR3.1–FR3.2, FR4.1–FR4.2, FR7.1, FR8.1.
- [x] **Step 4 – Business-Logik testen (`test/calc.test.ts`).** Je Anforderung mindestens ein Test: 48,50 € → 4,85 € / 53,35 €; `people 3` → 17,78 €; `round` → 54,00 € / 5,50 €; Stufe high = 15 %; `percent` + Stufe → Fehler; negative/ungültige Eingaben → Fehler; `people 0` → `runaway`. Ausführen: `npx vitest run test/calc.test.ts`.
- [x] **Step 5 – Format/Parsing implementieren (`src/format.ts`).** `formatEuro` (`12,34 €`, Tausendertrenner `.`), `parseAmount` (Komma oder Punkt, ungültig → Fehler). Rückverfolgung: FR5.3, FR6.1.
- [x] **Step 6 – Format/Parsing testen (`test/format.test.ts`).** Formatierung, Komma-/Punkt-Eingabe, ungültige Eingabe. Ausführen: `npx vitest run test/format.test.ts`.
- [x] **Step 7 – Sprüche implementieren (`src/phrases.ts`).** Feste Liste freundlicher Sprüche, Emoji-Liste, 0-Personen-Scherz-Text (augenzwinkernd), `pickPhrase(random)` injizierbar für Tests. Rückverfolgung: FR6.2, FR6.3, FR8.1, FR8.3.
- [x] **Step 8 – Sprüche testen (`test/phrases.test.ts`).** Spruch kommt aus der Liste, Ausgabe endet mit Emoji, Scherz-Hinweis enthält „Beine in die Hand". Ausführen: `npx vitest run test/phrases.test.ts`.
- [x] **Step 9 – CLI-Schicht implementieren (`src/cli.ts`, `src/bin.ts`).** `parseArgs` (`--percent`, `--tier`, `--people`, `--round`, `--help`), interaktiver Modus bei fehlendem Betrag, Ausgabe auf stdout, Fehler auf stderr mit Exit-Code 1, Scherz-Hinweis bei 0 Personen mit Exit-Code 0, deutsche `--help`. Rückverfolgung: FR5.1, FR5.2, FR5.4, FR6.1, FR6.2, FR7.1, FR8.2.
- [x] **Step 10 – CLI-Schicht testen (`test/cli.test.ts`).** `run(argv, io)` mit injizierten Ein-/Ausgabe-Funktionen: Standardlauf, interaktiver Modus (gemockte Eingabe), `--help`, Fehlerfall mit Exit-Code ≠ 0, `--people 0` mit Exit-Code 0 und Emoji am Ende. Ausführen: `npx vitest run test/cli.test.ts`.
- [x] **Step 11 – Build-Konfiguration prüfen.** `npm run build` erzeugt `dist/`, Shebang in `dist/bin.js`, manueller Rauchtest `node dist/bin.js 48,50`. Rückverfolgung: NFR1, NFR2.
- [x] **Step 12 – Dokumentation und Traceability.** `README.md` (Installation, Beispiele), `code-summary.md`, `source-manifest.json`, `traceability.json`. Rückverfolgung: alle FR/NFR.
- [x] **Step 13 – Änderungswunsch am Gate: Rundungsfrage im interaktiven Modus (`src/cli.ts`, `test/cli.test.ts`, `README.md`).** Im interaktiven Modus (Betrag fehlt) fragt die CLI bei jedem Lauf, ob auf den vollen Euro aufgerundet werden soll (Antworten: aufrunden / nicht runden; Standard bei leerer Eingabe: nicht runden). Wird der Betrag per Argument übergeben, entscheidet allein `--round`; es erscheint keine Rundungsfrage. Eine Antwort „aufrunden" wirkt wie `--round` (FR3.1/FR3.2). Abrunden gibt es bewusst nicht (Entscheidung des Nutzers: nur aufrunden oder gar nicht runden). Tests: interaktiv mit „aufrunden" → 54,00 € / 5,50 €; interaktiv mit „nicht runden" → 53,35 €; ungültige Antwort → Fehlermeldung, Exit-Code 1; Betrag per Argument → keine Rundungsfrage. Anschließend `code-summary.md`, `source-manifest.json`, `traceability.json` aktualisieren. Ausführen: `npx vitest run test/cli.test.ts`. Rückverfolgung: FR3.1, FR3.2, FR5.2 `[change-request]`.

## Story-/Anforderungs-Rückverfolgung

| Plan-Schritt | Anforderungen |
|--------------|---------------|
| 1, 2, 11 | NFR1, NFR2, NFR3 |
| 3, 4 | FR1, FR2, FR3, FR4, FR7, FR8 |
| 5, 6 | FR5.3, FR6.1 |
| 7, 8 | FR6.2, FR6.3, FR8.1, FR8.3 |
| 9, 10 | FR5, FR6, FR7, FR8.2 |
| 12 | alle |
