/**
 * alertDsl.test.js — Node built-in test runner.
 * Run with:
 *   node --test backend/tests/alertDsl.test.js
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, evaluate, validate } from '../services/alertDsl.js';

// Fake metrics provider — returns deterministic values for tests.
function mkProvider({ current = {}, series = {} } = {}) {
    return {
        current: (name) => {
            if (!(name in current)) throw new Error(`unknown metric ${name}`);
            return current[name];
        },
        series: (name, _win) => series[name] || [],
    };
}

test('parses a simple comparison', () => {
    const ast = parse('cpu_pct > 90');
    assert.equal(ast.type, 'cmp');
    assert.equal(ast.op, '>');
});

test('validate catches syntax errors', () => {
    assert.deepEqual(validate('cpu_pct >').ok, false);
    assert.deepEqual(validate('cpu_pct > 90').ok, true);
});

test('evaluates threshold', () => {
    const ast = parse('cpu_pct > 90');
    const mp = mkProvider({ current: { cpu_pct: 93 } });
    assert.equal(evaluate(ast, mp), true);
});

test('evaluates composite AND', () => {
    const ast = parse('cpu_pct > 80 && mem_pct > 70');
    const mp = mkProvider({ current: { cpu_pct: 85, mem_pct: 65 } });
    assert.equal(evaluate(ast, mp), false);
});

test('evaluates composite OR', () => {
    const ast = parse('cpu_pct > 99 || replica_lag_ms > 5000');
    const mp = mkProvider({ current: { cpu_pct: 20, replica_lag_ms: 6000 } });
    assert.equal(evaluate(ast, mp), true);
});

test('avg() function', () => {
    const ast = parse('avg(cpu_pct, 300) > 75');
    const mp = mkProvider({
        series: { cpu_pct: [{ t: 1, v: 60 }, { t: 2, v: 80 }, { t: 3, v: 90 }] },
    });
    assert.equal(evaluate(ast, mp), true); // avg = 76.67
});

test('rate() function', () => {
    const ast = parse('rate(bytes_in, 60) > 1000');
    const mp = mkProvider({
        series: { bytes_in: [{ t: 0, v: 0 }, { t: 60, v: 120000 }] },
    });
    assert.equal(evaluate(ast, mp), true); // (120000 - 0) / 60 = 2000
});

test('pct_change() function', () => {
    const ast = parse('pct_change(qps, 600) > 0.5');
    const mp = mkProvider({
        series: { qps: [{ t: 0, v: 100 }, { t: 600, v: 160 }] },
    });
    assert.equal(evaluate(ast, mp), true); // 60%
});

test('sustained() function', () => {
    const ast = parse("sustained(cpu_pct, '>', 85, 300)");
    const mp = mkProvider({
        series: { cpu_pct: [{ t: 1, v: 86 }, { t: 2, v: 90 }, { t: 3, v: 88 }] },
    });
    assert.equal(evaluate(ast, mp), true);
    const mp2 = mkProvider({
        series: { cpu_pct: [{ t: 1, v: 86 }, { t: 2, v: 70 }, { t: 3, v: 88 }] },
    });
    assert.equal(evaluate(ast, mp2), false);
});

test('arithmetic in thresholds', () => {
    const ast = parse('connection_count > 0.8 * max_connections');
    const mp = mkProvider({ current: { connection_count: 85, max_connections: 100 } });
    assert.equal(evaluate(ast, mp), true);
});
