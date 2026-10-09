# Cross-Unit-Rückverfolgbarkeit – Trinkgeld-CLI

## Ergebnis

**Verdikt: PASS.** Alle 23 Anforderungs-IDs (FR1.1–FR8.3, NFR1–NFR4) aus `requirements.md` sind in `construction/code-generation/traceability.json` mit Status `OK` belegt; jede Zieldatei existiert im Workspace. Nicht abgedeckte IDs: keine.

Die Gruppenüberschriften FR1–FR8 sind durch ihre Unter-Anforderungen abgedeckt. Benutzergeschichten (`stories.md`) gibt es im Express-Umfang nicht, daher entfallen AC-IDs.

## Abdeckung je ID

| ID | Zuständig | Zieldatei | Status |
|----|-----------|-----------|--------|
| FR1.1 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR1.2 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR1.3 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR2.1 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR3.1 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR3.2 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR4.1 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR4.2 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR5.1 | Stage-Ebene (Express, keine Units) | `src/cli.ts` | OK |
| FR5.2 | Stage-Ebene (Express, keine Units) | `src/cli.ts` | OK |
| FR5.3 | Stage-Ebene (Express, keine Units) | `src/format.ts` | OK |
| FR5.4 | Stage-Ebene (Express, keine Units) | `src/cli.ts` | OK |
| FR6.1 | Stage-Ebene (Express, keine Units) | `src/format.ts` | OK |
| FR6.2 | Stage-Ebene (Express, keine Units) | `src/phrases.ts` | OK |
| FR6.3 | Stage-Ebene (Express, keine Units) | `src/phrases.ts` | OK |
| FR7.1 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR8.1 | Stage-Ebene (Express, keine Units) | `src/calc.ts` | OK |
| FR8.2 | Stage-Ebene (Express, keine Units) | `src/cli.ts` | OK |
| FR8.3 | Stage-Ebene (Express, keine Units) | `src/phrases.ts` | OK |
| NFR1 | Stage-Ebene (Express, keine Units) | `package.json` | OK |
| NFR2 | Stage-Ebene (Express, keine Units) | `src/bin.ts` | OK |
| NFR3 | Stage-Ebene (Express, keine Units) | `test/calc.test.ts` | OK |
| NFR4 | Stage-Ebene (Express, keine Units) | `package.json` | OK |

## Nicht abgedeckte Elemente

Keine.
