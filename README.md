# Rechenfuchs 🦊

Mathe-Übungsspiel für die 4. Primarklasse (Lehrplan 21, Zyklus 2): Aufgaben lösen, Münzen verdienen, damit den Fuchs einkleiden.

Vanilla JS, buildless, läuft im Browser bzw. als PWA auf dem Tablet. Kein Backend, kein Konto, Fortschritt bleibt lokal im Gerät.

> Status: Konzeptphase – die Aufgaben-Generatoren stehen, die Oberfläche noch nicht.

## Idee

- **Aufgaben werden generiert**, nicht aus einer Datenbank geladen: unendlich viele Aufgaben, Lösung immer korrekt.
- **Adaptive Schwierigkeit** pro Aufgabenart: 3 richtig in Folge → Stufe hoch, 2 falsch → Stufe runter.
- **Belohnung für Leistung, nicht für Masse:** Münzen nur für richtige Antworten, skaliert mit der Stufe; Tageslimit; Shop-Artikel sind kleine Ziele. Keine Ranglisten.
- **Maskottchen:** ein Fuchs, den man mit den Münzen einkleidet.

## Aufgabenarten

| Typ | Stufe 1 → 5 |
|---|---|
| `zahlenraum` ⭐ | Stellenwert ablesen bis 10'000 → Zahl aus ZT/T/H/Z/E zusammensetzen → Nachbarzahlen, Vorgänger/Nachfolger → Vergleichen (<, =, >) und ±1'000/10'000/100'000 → Zahlenstrahl und Zahlwort → Ziffern |
| `einmaleins` | 2er/5er/10er (Auswahl) → kleines 1×1 → fehlender Faktor → Division → Zehnerzahlen (70 · 8) |
| `runden` | auf Zehner → Hunderter → Tausender → Zehntausender → gemischt |
| `masseinheiten` | m/cm, Fr./Rp. → kg/g, h/min → gemischte Angaben → Fr. 13.75 = ? Rp. → zurück in grössere Einheit |
| `schriftlich` | Addition 2–4 Stellen → Subtraktion 4 Stellen → 5 Stellen gemischt |

⭐ aktuelles Klassenthema: Zahlenraum bis 1 Million.

Neue Aufgabenart = neuer Eintrag in `generators` mit `make(level, rng) → Task` (siehe JSDoc in `src/generators.js`).

### Eingabearten (`task.input`)

| Wert | Darstellung | Antwort |
|---|---|---|
| `number` | Eingabefeld + Ziffernblock, optional `unit` | Zahl (12'345, 12 345 und 2,5 werden akzeptiert) |
| `choice` | Buttons aus `choices` | Zahl |
| `column` | Stellenraster für schriftliches Rechnen (`column.a`, `column.b`, `column.op`) | Zahl |
| `compare` | `a ○ b` mit Buttons <, =, > | `<`, `=`, `>` (intern -1, 0, 1) |
| `numberline` | Zahlenstrahl `min`…`max` mit `ticks` Abschnitten, Teilstrich `marked` hervorgehoben | Zahl |

## Struktur

```
src/generators.js        Generatoren, check(), Trainer, numberToWords() (kein DOM)
tests/*.test.mjs         node:test
```

## Tests

```sh
node --test tests/*.test.mjs
```
