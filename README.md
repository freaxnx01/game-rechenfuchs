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
| `einmaleins` | 2er/5er/10er (Auswahl) → kleines 1×1 → fehlender Faktor → Division → Zehnerzahlen (70 · 8) |
| `runden` | auf Zehner → Hunderter → Tausender → Zehntausender → gemischt |
| `masseinheiten` | m/cm, Fr./Rp. → kg/g, h/min → gemischte Angaben → Fr. 13.75 = ? Rp. → zurück in grössere Einheit |
| `schriftlich` | Addition 2–4 Stellen → Subtraktion 4 Stellen → 5 Stellen gemischt |

Neue Aufgabenart = neuer Eintrag in `generators` mit `make(level, rng) → Task` (siehe JSDoc in `src/generators.js`).

## Struktur

```
src/generators.js        Generatoren, check(), Trainer (kein DOM)
tests/*.test.mjs         node:test
```

## Tests

```sh
node --test tests/*.test.mjs
```
