import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generators, makeRng, check, Trainer, MAX_LEVEL } from '../src/generators.js';

test('jeder Generator liefert auf jeder Stufe lösbare Aufgaben', () => {
  const rng = makeRng(42);
  for (const [type, g] of Object.entries(generators)) {
    for (let level = 1; level <= MAX_LEVEL; level++) {
      for (let i = 0; i < 300; i++) {
        const t = g.make(level, rng);
        assert.ok(Number.isFinite(t.answer), `${type} L${level}: answer`);
        assert.ok(t.prompt, `${type} L${level}: prompt`);
        if (t.input === 'choice') assert.ok(t.choices.includes(t.answer), `${type} L${level}: choices`);
        assert.ok(check(t, String(t.answer)), `${type} L${level}: check`);
      }
    }
  }
});

test('Runden: keine bereits gerundeten Zahlen', () => {
  const rng = makeRng(7);
  for (let level = 1; level <= MAX_LEVEL; level++) {
    for (let i = 0; i < 1000; i++) {
      const t = generators.runden.make(level, rng);
      const n = Number(t.prompt.replace(/[^0-9]/g, ''));
      assert.notEqual(n, t.answer);
    }
  }
});

test('check akzeptiert Schweizer Schreibweisen', () => {
  assert.ok(check({ answer: 12345 }, '12’345'));
  assert.ok(check({ answer: 12345 }, "12'345"));
  assert.ok(check({ answer: 12345 }, ' 12 345 '));
  assert.ok(check({ answer: 2.5 }, '2,5'));
  assert.ok(!check({ answer: 0 }, ''));
});

test('Trainer: 3 richtig → Stufe hoch, 2 falsch → Stufe runter', () => {
  const tr = new Trainer({ types: ['einmaleins'], rng: makeRng(1) });
  for (let i = 0; i < 3; i++) { const t = tr.next(); tr.submit(t, t.answer); }
  assert.equal(tr.state.levels.einmaleins, 2);
  for (let i = 0; i < 2; i++) { const t = tr.next(); tr.submit(t, 'falsch'); }
  assert.equal(tr.state.levels.einmaleins, 1);
});

test('Münzen nur für richtige Antworten, skaliert mit Stufe', () => {
  const tr = new Trainer({ types: ['einmaleins'], rng: makeRng(3), state: { levels: { einmaleins: 4 }, streak: { einmaleins: 0 } } });
  const t = tr.next();
  assert.equal(tr.submit(t, t.answer).coins, 4);
  const t2 = tr.next();
  assert.equal(tr.submit(t2, 'x').coins, 0);
});
