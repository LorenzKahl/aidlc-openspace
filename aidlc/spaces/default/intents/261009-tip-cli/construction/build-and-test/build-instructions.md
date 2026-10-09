# Build-Anleitung – Trinkgeld-CLI

## Voraussetzungen und Setup

- Node.js LTS (≥ 20), npm. Keine Umgebungsvariablen, keine Konfigurationsdateien, keine lokalen Dienste nötig.
- Abhängigkeiten installieren: `npm ci` (Dev-Abhängigkeiten: `typescript`, `vitest`, `@types/node`; keine Laufzeit-Abhängigkeiten).

## Build

- `npm run build` (ruft `tsc -p tsconfig.json` auf und erzeugt `dist/`).

## Build-Prüfung

- `dist/bin.js` beginnt mit `#!/usr/bin/env node`.
- Rauchtest: `node dist/bin.js 48,50` gibt 4,85 € Trinkgeld und 53,35 € gesamt aus, Exit-Code 0, letzte Zeichen ein Emoji.

## Fehlerbehebung

- `tsc: command not found` → `npm ci` ausführen.
- Falsche Node-Version → `node --version` prüfen (≥ 20).
