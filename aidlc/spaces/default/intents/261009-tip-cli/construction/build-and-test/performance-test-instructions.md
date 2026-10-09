# Performance-Test-Anleitung – Trinkgeld-CLI

## Umfang

Einziges Ziel ist NFR2: Eine Berechnung im nicht-interaktiven Modus beendet sich in unter 500 ms. Kein Lasttest nötig.

## Messung

- Nach `npm run build`: `time node dist/bin.js 48,50`
- Erwartung: Gesamtlaufzeit < 0,5 s.
