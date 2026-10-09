# Integrationstest-Anleitung – Trinkgeld-CLI

## Umfang

Für die Teststrategie Minimal (Express) sind keine eigenen Integrationstests vorgesehen. Die CLI hat keine externen Abhängigkeiten, keine Datenbank und nur eine Komponente (kein Cross-Unit-Zusammenspiel).

## Abdeckung

Das Zusammenspiel von `cli.ts`, `calc.ts`, `format.ts` und `phrases.ts` prüft `test/cli.test.ts` bereits Ende-zu-Ende über das injizierte `io`-Objekt. Ausführen: `npx vitest run test/cli.test.ts`.
