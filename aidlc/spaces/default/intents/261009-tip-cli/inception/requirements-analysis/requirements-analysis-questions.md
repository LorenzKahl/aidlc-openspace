# Requirements Analysis – Rückfragen

Initial description: baue eine trinkgeld cli

Kontext: Greenfield-Projekt, Express-Umfang (minimale Tiefe). Die Fragen klären nur das, was für die Anforderungen wirklich nötig ist.

## Question 1: Programmiersprache / Laufzeit

In welcher Sprache soll die CLI gebaut werden? Davon hängen Build, Tests und Verteilung ab.

A. Python (einzelnes Skript bzw. Paket, läuft überall mit Python 3)
B. Node.js / TypeScript (npm-Paket)
C. Go (eine einzelne ausführbare Datei)
D. Rust (eine einzelne ausführbare Datei)
X. Other (please specify)

[Answer]: B. Node.js / TypeScript

## Question 2: Funktionsumfang

Was soll die CLI mindestens können?

A. Nur Trinkgeld berechnen: Rechnungsbetrag + Prozentsatz → Trinkgeld und Gesamtbetrag
B. Wie A, plus Rechnung auf mehrere Personen aufteilen (Pro-Kopf-Betrag)
C. Wie B, plus Aufrunden (z. B. auf volle Euro) und eine Liste vordefinierter Trinkgeld-Stufen (z. B. 5 %, 10 %, 15 %)
X. Other (please specify)

[Answer]: C. Wie B, plus Aufrunden und vordefinierte Stufen

## Question 3: Bedienung und Ausgabe

Wie wird die CLI bedient, und wie sieht die Ausgabe aus?

A. Nur über Argumente/Flags (z. B. `tip 48.50 --percent 10`), Ausgabe als lesbarer Text
B. Wie A, zusätzlich ein interaktiver Modus, der Werte abfragt, wenn Argumente fehlen
C. Wie A, zusätzlich maschinenlesbare Ausgabe (`--json`)
X. Other (please specify)

[Answer]: B und die Ausgabe soll noch einen netten Spruch für die Bedienung enthalten und es soll auf jeden Fall noch ein Emoji am Ende enthalten sein zur Erheiterung.

## Question 4: Sprache der Ausgabe, Währung und Standard-Prozentsatz

Welche Konventionen gelten für Ausgabe und Standardwerte?

A. Deutsch, Euro (€), Dezimalkomma, Standard-Trinkgeld 10 %
B. Englisch, Dollar ($), Dezimalpunkt, Standard-Trinkgeld 15 %
C. Deutsch, Euro (€), Dezimalkomma, Standard-Trinkgeld 5 %
X. Other (please specify)

[Answer]: A. Deutsch, Euro (€), Dezimalkomma, Standard-Trinkgeld 10 %
