# Sicherheitstest-Anleitung – Trinkgeld-CLI

## Umfang

Es gibt keine Authentifizierung, keine Netzwerkzugriffe und keine Speicherung personenbezogener Daten (NFR4). Relevante Prüfungen:

- Abhängigkeiten: `npm audit --omit=dev` (Erwartung: 0 Schwachstellen; keine Laufzeit-Abhängigkeiten).
- Eingabevalidierung: ungültige Beträge, negative Zahlen und unbekannte Antworten ergeben Fehlermeldung und Exit-Code 1 (abgedeckt durch `test/calc.test.ts`, `test/format.test.ts`, `test/cli.test.ts`).
- Keine hartkodierten Geheimnisse im Quellcode.
