import test from 'node:test';
import assert from 'node:assert/strict';
import { attack, isFainted } from './battle.js';
import { getTypeEffectiveness } from './typeChart.js';
const base = (name, types) => ({ id: name, name, types, level: 12, currentHp: 60, stats: { hp: 60, attack: 30, defense: 25, specialAttack: 30, specialDefense: 25, speed: 30 }, moves: [] });
const move = { name: 'test', type: 'fire', power: 60, accuracy: 100, category: 'special', pp: 10, maxPP: 10 };
test('required type matchups', () => { assert.equal(getTypeEffectiveness('fire', ['grass']), 2); assert.equal(getTypeEffectiveness('water', ['fire']), 2); assert.equal(getTypeEffectiveness('electric', ['water']), 2); assert.equal(getTypeEffectiveness('electric', ['rock', 'ground']), 0); assert.equal(getTypeEffectiveness('normal', ['ghost']), 0); });
test('damage, PP, immunity, and fainting work', () => { const charmander = { ...base('charmander', ['fire']), moves: [move] }; const bulbasaur = base('bulbasaur', ['grass']); const result = attack(charmander, bulbasaur, move, () => .99); assert.ok(result.damage > 0); assert.equal(result.attacker.moves[0].pp, 9); const immune = attack({ ...charmander, moves: [{ ...move, type: 'normal' }] }, base('gastly', ['ghost']), { ...move, type: 'normal' }, () => .99); assert.equal(immune.damage, 0); assert.equal(isFainted({ ...bulbasaur, currentHp: 0 }), true); });
