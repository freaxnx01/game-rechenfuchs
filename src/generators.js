// generators.js – Aufgaben-Generatoren für Mathe 4. Klasse (CH)
// Vanilla ES module, buildless. Kein DOM-Zugriff: rein logisch, testbar mit Node.
//
// Aufbau:
//   1. RNG (seedbar → reproduzierbare Tests)
//   2. Helfer (Formatierung de-CH, Multiple-Choice-Distraktoren)
//   3. Generatoren-Registry: je Typ make(level, rng) → Task
//   4. check(): Antwort prüfen (toleriert 12'345, Leerzeichen, Komma)
//   5. Trainer: adaptive Schwierigkeit + Münzen pro Aufgabe

/**
 * @typedef {Object} Task
 * @property {string}  type      Generator-Schlüssel, z.B. 'einmaleins'
 * @property {number}  level     1–5
 * @property {string}  prompt    Anzeige-Text, z.B. '7 · 8 = ?'
 * @property {number}  answer    Erwartete Lösung (immer Zahl)
 * @property {'number'|'choice'|'column'} input  UI-Variante
 * @property {number[]} [choices]  bei input 'choice'
 * @property {{a:number,b:number,op:'+'|'-'}} [column]  bei input 'column' (schriftlich)
 * @property {string}  [unit]    Einheit hinter dem Eingabefeld, z.B. 'cm'
 * @property {string}  [hint]    Tipp, der nach einem Fehler gezeigt werden kann
 */

export const MAX_LEVEL = 5;

// ---------- 1. RNG ----------

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed = Date.now()) {
  const r = mulberry32(seed);
  const int = (min, max) => min + Math.floor(r() * (max - min + 1));
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  return { next: r, int, pick, shuffle };
}

// ---------- 2. Helfer ----------

const nf = new Intl.NumberFormat('de-CH');
export const fmt = (n) => nf.format(n); // 12345 → 12’345

/** Plausible falsche Antworten rund um die Lösung (typische Fehler: ±Faktor, ±1 Stelle). */
function makeChoices(answer, rng, spread, count = 4) {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < count && guard++ < 50) {
    const d = rng.int(1, 3) * spread * (rng.next() < 0.5 ? -1 : 1);
    if (answer + d > 0) set.add(answer + d);
  }
  return rng.shuffle([...set]);
}

// ---------- 3. Generatoren ----------
// Jeder Generator: { title, make(level, rng) → Task ohne type/level }
// Level-Leitlinie: 1 = Einstieg, 3 = Stoff der 4. Klasse, 5 = Knobeln.

export const generators = {
  einmaleins: {
    title: 'Einmaleins',
    make(level, rng) {
      switch (level) {
        case 1: { // 2er, 5er, 10er – Multiple Choice
          const a = rng.pick([2, 5, 10]), b = rng.int(1, 10);
          return { prompt: `${a} · ${b} = ?`, answer: a * b, input: 'choice', choices: makeChoices(a * b, rng, a) };
        }
        case 2: { // ganzes kleines Einmaleins
          const a = rng.int(2, 10), b = rng.int(2, 10);
          return { prompt: `${a} · ${b} = ?`, answer: a * b, input: 'number' };
        }
        case 3: { // fehlender Faktor
          const a = rng.int(3, 10), b = rng.int(3, 10);
          return { prompt: `${a} · ? = ${a * b}`, answer: b, input: 'number', hint: `Welche Zahl mal ${a} gibt ${a * b}?` };
        }
        case 4: { // Division als Umkehraufgabe
          const a = rng.int(3, 10), b = rng.int(3, 10);
          return { prompt: `${a * b} : ${a} = ?`, answer: b, input: 'number', hint: `Denk an: ${a} · ? = ${a * b}` };
        }
        default: { // Zehnerzahlen: 70 · 8
          const a = rng.int(2, 9) * 10, b = rng.int(2, 9);
          return { prompt: `${a} · ${b} = ?`, answer: a * b, input: 'number', hint: `Rechne zuerst ${a / 10} · ${b}, dann mal 10.` };
        }
      }
    },
  },

  runden: {
    title: 'Runden',
    make(level, rng) {
      // [Stelle, Zahlenraum-Max]
      const cfg = [[10, 999], [100, 9_999], [1_000, 99_999], [10_000, 999_999], [rng.pick([100, 1_000, 10_000]), 999_999]][level - 1];
      const [step, max] = cfg;
      let n;
      do { n = rng.int(step + 1, max); } while (n % step === 0); // keine schon gerundeten Zahlen
      const answer = Math.round(n / step) * step; // Schulregel: ab 5 aufrunden
      const label = { 10: 'Zehner', 100: 'Hunderter', 1000: 'Tausender', 10000: 'Zehntausender' }[step];
      const base = { prompt: `Runde ${fmt(n)} auf ${label}.`, answer, hint: `Schau auf die Ziffer rechts neben den ${label}n.` };
      return level <= 2
        ? { ...base, input: 'choice', choices: makeChoices(answer, rng, step) }
        : { ...base, input: 'number' };
    },
  },

  masseinheiten: {
    title: 'Masseinheiten',
    make(level, rng) {
      // Jede Vorlage: minLevel, Generator → { prompt, answer, unit }
      const templates = [
        [1, () => { const m = rng.int(1, 9); return { prompt: `${m} m = ? cm`, answer: m * 100, unit: 'cm' }; }],
        [1, () => { const f = rng.int(1, 9); return { prompt: `Fr. ${f}.– = ? Rp.`, answer: f * 100, unit: 'Rp.' }; }],
        [2, () => { const kg = rng.int(1, 9); return { prompt: `${kg} kg = ? g`, answer: kg * 1000, unit: 'g' }; }],
        [2, () => { const h = rng.int(1, 5); return { prompt: `${h} h = ? min`, answer: h * 60, unit: 'min' }; }],
        [3, () => { const m = rng.int(1, 9), cm = rng.int(1, 99); return { prompt: `${m} m ${cm} cm = ? cm`, answer: m * 100 + cm, unit: 'cm' }; }],
        [3, () => { const km = rng.int(1, 20); return { prompt: `${km} km = ? m`, answer: km * 1000, unit: 'm' }; }],
        [4, () => { const f = rng.int(1, 20), rp = rng.pick([5, 10, 20, 50, 75, 95]); return { prompt: `Fr. ${f}.${String(rp).padStart(2, '0')} = ? Rp.`, answer: f * 100 + rp, unit: 'Rp.' }; }],
        [4, () => { const h = rng.int(1, 4), min = rng.pick([5, 15, 20, 30, 45]); return { prompt: `${h} h ${min} min = ? min`, answer: h * 60 + min, unit: 'min' }; }],
        [5, () => { const g = rng.int(2, 9) * 1000; return { prompt: `${fmt(g)} g = ? kg`, answer: g / 1000, unit: 'kg' }; }],
        [5, () => { const min = rng.int(2, 6) * 60; return { prompt: `${min} min = ? h`, answer: min / 60, unit: 'h' }; }],
      ];
      // Aktuelles Level bevorzugen, ältere Vorlagen als Wiederholung beimischen
      const pool = templates.filter(([min]) => min <= level);
      const fresh = pool.filter(([min]) => min === level);
      const [, make] = rng.next() < 0.7 && fresh.length ? rng.pick(fresh) : rng.pick(pool);
      return { ...make(), input: 'number' };
    },
  },

  schriftlich: {
    title: 'Schriftlich rechnen',
    make(level, rng) {
      // [Stellen, Operation]
      const [digits, op] = [[2, '+'], [3, '+'], [4, '+'], [4, '-'], [5, rng.pick(['+', '-'])]][level - 1];
      const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
      let a = rng.int(lo, hi), b = rng.int(lo, hi);
      if (op === '-' && b > a) [a, b] = [b, a];
      const answer = op === '+' ? a + b : a - b;
      return { prompt: `${fmt(a)} ${op} ${fmt(b)}`, answer, input: 'column', column: { a, b, op } };
    },
  },
};

// ---------- 4. Antwort prüfen ----------

export function normalize(input) {
  return String(input ?? '').trim().replace(/[’'\s]/g, '').replace(',', '.');
}

export function check(task, input) {
  const v = normalize(input);
  return v !== '' && Number(v) === task.answer;
}

// ---------- 5. Trainer: adaptive Schwierigkeit + Münzen ----------

const UP_AFTER = 3;   // 3 richtig in Folge → Level hoch
const DOWN_AFTER = 2; // 2 falsch in Folge → Level runter

export class Trainer {
  /**
   * @param {{ types?: string[], rng?: ReturnType<typeof makeRng>, state?: object }} [opts]
   * state ist serialisierbar (localStorage) – Wallet/Shop liegen bewusst ausserhalb.
   */
  constructor({ types = Object.keys(generators), rng = makeRng(), state } = {}) {
    this.types = types;
    this.rng = rng;
    this.state = state ?? {
      levels: Object.fromEntries(types.map((t) => [t, 1])),
      streak: Object.fromEntries(types.map((t) => [t, 0])), // >0 richtig-Serie, <0 falsch-Serie
    };
  }

  /** @returns {Task} */
  next(type = this.rng.pick(this.types)) {
    const level = this.state.levels[type];
    return { type, level, ...generators[type].make(level, this.rng) };
  }

  /** @returns {{correct:boolean, answer:number, coins:number, level:number, levelChange:-1|0|1, hint?:string}} */
  submit(task, input) {
    const correct = check(task, input);
    const { levels, streak } = this.state;
    const t = task.type;
    let levelChange = 0;

    if (correct) {
      streak[t] = Math.max(0, streak[t]) + 1;
      if (streak[t] >= UP_AFTER && levels[t] < MAX_LEVEL) { levels[t]++; streak[t] = 0; levelChange = 1; }
    } else {
      streak[t] = Math.min(0, streak[t]) - 1;
      if (streak[t] <= -DOWN_AFTER && levels[t] > 1) { levels[t]--; streak[t] = 0; levelChange = -1; }
    }

    // Belohnung nur für korrekte Aufgaben, skaliert mit Level → Farmen auf Level 1 lohnt sich nicht.
    // Tageslimit gehört ins Wallet, nicht hierher.
    const coins = correct ? task.level : 0;

    return { correct, answer: task.answer, coins, level: levels[t], levelChange, hint: correct ? undefined : task.hint };
  }
}
