# Status: Generatoren gepusht – nächster Schritt Issue #1

Stand 2026-10-23, Branch `worktree-init` (= `origin/main` @ `f7038ca` + Handoff-Commit).

## Erledigt

- `src/generators.js` (Generatoren `einmaleins`, `runden`, `masseinheiten`, `schriftlich`; `check()`, `normalize()`, `Trainer` mit adaptiver Stufe und Münzen) und `.gitignore` → Commit `875baff`.
- `tests/generators.test.mjs` (5 Tests, `node --test tests/*.test.mjs`, alle grün) → Commit `46d1e49`.
- Beides auf `main` gepusht. Quelle der Dateien war `~/LocalSend/` (Originale liegen dort noch).

## Offene Diskrepanz (nicht angefasst)

Commit `f7038ca` (Refs #5, aus einer anderen Session) dokumentiert im README Dinge, die im Code **fehlen**:

- Generator `zahlenraum` (Stufen 1–5, aktuelles Klassenthema bis 1 Million)
- Eingabearten `compare` (<, =, >; intern -1/0/1) und `numberline` (`min`, `max`, `ticks`, `marked`)
- `numberToWords()` in `src/generators.js`

Kein Branch, kein Worktree und kein PR enthält diesen Code. Klären, bevor Issue #1 umgesetzt wird: Der Aufgaben-Screen soll alle `input`-Varianten rendern. Liegt die Implementierung irgendwo (LocalSend, andere Maschine)? Oder gehört sie zu #5 und ist noch offen?

## Nächster Schritt: Issue #1 – Aufgaben-Screen (`index.html`, buildless)

Issue-Inhalt (Label `needs-enrichment`, also noch kein Spec/Plan):

- `index.html` im Root (GitHub Pages), Vanilla JS als ES-Modul, kein Build
- Rendert `number` (grosses Feld + Ziffernblock, `unit`), `choice` (4 grosse Buttons), `column` (Stellenraster, Eingabe rechts → links)
- Feedback: richtig → Animation + Münzen; falsch → `hint`, zweiter Versuch, dann Lösung
- Themenwahl (alle / einzelne Aufgabenart)
- `Trainer.state` in `localStorage` (try/catch, funktioniert auch ohne)
- Akzeptanz: Tablet hochkant 768px ohne Tastatur bedienbar, kein horizontales Scrollen, Name des Kindes erscheint nirgends

Vorgehen: Issue zuerst anreichern (`/enrich 1`: Spec + Plan), dann umsetzen. Das Repo hat (Stand heute) keine agent-workflow-Pipeline (kein `.github/workflows/`). Deshalb lokal mit `superpowers:subagent-driven-development` umsetzen.
