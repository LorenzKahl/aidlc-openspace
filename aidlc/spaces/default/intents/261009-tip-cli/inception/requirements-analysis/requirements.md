# Anforderungen – Trinkgeld-CLI

## Sources

- `[desc]` Initial description: baue eine trinkgeld cli
- `[scope]` Workflow-selected scope: express (Minimal depth, Greenfield)
- `[Q1]` Node.js / TypeScript
- `[Q2]` Umfang C: berechnen, aufteilen, aufrunden, vordefinierte Stufen
- `[Q3]` Argumente/Flags plus interaktiver Modus; Ausgabe mit nettem Spruch und abschließendem Emoji
- `[Q4]` Deutsch, Euro (€), Dezimalkomma, Standard-Trinkgeld 10 %
- `[change-request]` Änderungswunsch am Gate: bei Personenzahl 0 ein Hinweis, die Beine in die Hand zu nehmen und die Zeche zu prellen

## Intent-Analyse

Eine kleine Kommandozeilenanwendung, mit der man bei einer Restaurantrechnung schnell das Trinkgeld, den Gesamtbetrag und den Betrag pro Person berechnet. Die Ausgabe soll unterhaltsam sein (Spruch und Emoji). `[desc]`

## Funktionale Anforderungen

### FR1 – Trinkgeld berechnen
- **FR1.1** Die CLI nimmt einen Rechnungsbetrag entgegen und berechnet daraus Trinkgeld und Gesamtbetrag. `[desc]`
- **FR1.2** Der Trinkgeld-Prozentsatz ist per `--percent` einstellbar; ohne Angabe gilt 10 %. `[Q4]`
- **FR1.3** Beträge werden auf zwei Nachkommastellen kaufmännisch gerundet ausgegeben. `[assumption]`

### FR2 – Rechnung aufteilen
- **FR2.1** Per `--people` (Ganzzahl ≥ 1; 0 siehe FR8) wird der Gesamtbetrag auf mehrere Personen aufgeteilt und der Betrag pro Person ausgegeben; Standard ist 1 Person. `[Q2]`

### FR3 – Aufrunden
- **FR3.1** Per `--round` wird der Gesamtbetrag (bzw. der Betrag pro Person) auf den nächsten vollen Euro aufgerundet; das Trinkgeld passt sich entsprechend an. `[Q2]`
- **FR3.2** Gilt `--round` zusammen mit `--people`, wird der Betrag pro Person aufgerundet. `[assumption]`

### FR4 – Vordefinierte Trinkgeld-Stufen
- **FR4.1** Die CLI bietet die Stufen 5 %, 10 % und 15 % an (z. B. `--tier low|normal|high`, entsprechend 5/10/15 %). `[Q2]`
- **FR4.2** Wird `--percent` zusammen mit einer Stufe angegeben, ist das ein Fehler mit verständlicher Meldung. `[assumption]`

### FR5 – Bedienung
- **FR5.1** Alle Werte können als Argumente/Flags übergeben werden (z. B. `tip 48,50 --percent 10`). `[Q3]`
- **FR5.2** Fehlt der Rechnungsbetrag, startet ein interaktiver Modus und fragt die fehlenden Werte (Betrag, Prozentsatz bzw. Stufe, Personenzahl) ab. `[Q3]`
- **FR5.3** Beträge dürfen mit Dezimalkomma oder Dezimalpunkt eingegeben werden. `[assumption]`
- **FR5.4** `--help` zeigt eine deutsche Kurzbeschreibung aller Optionen. `[assumption]`

### FR6 – Ausgabe
- **FR6.1** Die Ausgabe ist deutsch, Beträge im Format `12,34 €` (Dezimalkomma, €-Zeichen). `[Q4]`
- **FR6.2** Jede erfolgreiche Ausgabe enthält einen netten Spruch (zufällig aus einer festen Liste) und endet mit einem Emoji als letztem Zeichen. `[Q3]`
- **FR6.3** Der Spruch bezieht sich auf die Bedienung/Trinkgeld-Situation und ist harmlos und freundlich. `[assumption]`

### FR7 – Fehlerbehandlung
- **FR7.1** Ungültige Eingaben (negativer oder nicht numerischer Betrag, Prozentsatz < 0, Personenzahl negativ oder keine Ganzzahl) führen zu einer verständlichen deutschen Fehlermeldung auf stderr und Exit-Code ≠ 0. `[assumption]`

### FR8 – Scherz-Hinweis bei 0 Personen
- **FR8.1** Ist die Personenzahl genau 0 (`--people 0` oder 0 im interaktiven Modus), berechnet die CLI nichts, sondern gibt einen augenzwinkernden Hinweis aus: die Person solle die Beine in die Hand nehmen und losrennen, um die Zeche zu prellen. Die Ausgabe endet wie jede andere mit einem Emoji. `[change-request]`
- **FR8.2** Dieser Fall ist ein Spaß-Hinweis und kein Fehler: Ausgabe auf stdout, Exit-Code 0. `[assumption]`
- **FR8.3** Der Hinweis ist ausdrücklich scherzhaft formuliert (kein ernst gemeinter Aufruf zum Zechprellen). `[assumption]`

## Nicht-funktionale Anforderungen

- **NFR1** Technologie: Node.js (LTS) mit TypeScript, als npm-Paket mit `bin`-Eintrag installierbar/ausführbar. `[Q1]`
- **NFR2** Performance: Eine Berechnung im Nicht-interaktiven Modus beendet sich in unter 500 ms. `[assumption]`
- **NFR3** Testbarkeit: Die Berechnungslogik ist von Ein-/Ausgabe getrennt und per Unit-Tests prüfbar; mindestens ein Test je funktionaler Anforderung (Express-Teststrategie Minimal). `[scope]`
- **NFR4** Keine Laufzeit-Netzwerkzugriffe, keine Speicherung personenbezogener Daten. `[assumption]`

## Akzeptanzkriterien (Auswahl)

- **FR1/FR2** Given Rechnung 48,50 €, Standard-Prozentsatz, When `tip 48,50`, Then Trinkgeld 4,85 €, Gesamtbetrag 53,35 €.
- **FR2** Given 48,50 € und `--people 3`, When ausgeführt, Then Pro-Kopf-Betrag 17,78 €.
- **FR3** Given 48,50 € und `--round`, When ausgeführt, Then Gesamtbetrag 54,00 € und Trinkgeld 5,50 €.
- **FR4** Given `--tier high`, When ausgeführt, Then wird mit 15 % gerechnet.
- **FR5.2** Given kein Betrag, When `tip` gestartet wird, Then werden die Werte interaktiv abgefragt.
- **FR6.2** Given eine gültige Berechnung, Then endet die Ausgabe mit einem Emoji.
- **FR7.1** Given `--people -1`, When ausgeführt, Then Fehlermeldung und Exit-Code ≠ 0.
- **FR8.1** Given `--people 0`, When ausgeführt, Then erscheint der scherzhafte „Beine in die Hand nehmen"-Hinweis, Exit-Code 0, und die Ausgabe endet mit einem Emoji.

## Constraints

- Node.js / TypeScript. `[Q1]`
- Express-Umfang: keine separaten Design-, Reviewer- oder Operations-Stufen. `[scope]`

## Assumptions & Open Questions

Die mit `[assumption]` markierten Punkte sind Annahmen und gelten erst nach Bestätigung durch den Nutzer als Anforderung:

- Rundung auf zwei Nachkommastellen, kaufmännisch (FR1.3)
- Kombination `--round` mit `--people` rundet pro Person (FR3.2)
- Stufen und `--percent` schließen sich aus (FR4.2)
- Eingabe mit Komma oder Punkt (FR5.3), deutsche `--help` (FR5.4)
- „Spruch für die Bedienung" wird als freundlicher Spruch in der Ergebnisausgabe verstanden (FR6.3)
- Fehlerverhalten und Exit-Codes (FR7.1) sowie Performance-Ziel (NFR2)
- 0 Personen ist ein Scherz-Hinweis mit Exit-Code 0 statt eines Fehlers, und der Hinweis ist erkennbar scherzhaft formuliert (FR8.2, FR8.3)

Offene Fragen: Keine.

## Out of scope

- Mehrwährungsunterstützung, Lokalisierung außer Deutsch
- Speichern von Verlauf oder Konfiguration
- Grafische Oberfläche, Web-API
- Unterschiedliche Trinkgeldsätze pro Person
