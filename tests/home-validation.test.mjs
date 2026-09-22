import assert from 'node:assert/strict';
import { initialHome } from '../data/home.ts';
import { validHome } from '../lib/homeValidation.ts';

const data = structuredClone(initialHome);
for (const item of data.segments) item.id = crypto.randomUUID();
for (const item of data.info_cards) item.id = crypto.randomUUID();
assert.equal(validHome(data), true);

// Invalid structures
for (const invalid of [null, {}, [], { ...data, profile: null }, { ...data, segments: null }]) {
  assert.equal(validHome(invalid), false);
}

// Oversized
const tooLong = structuredClone(data);
tooLong.profile.description = 'x'.repeat(1001);
assert.equal(validHome(tooLong), false);

const tooLongSegment = structuredClone(data);
tooLongSegment.segments[0].text = 'x'.repeat(201);
assert.equal(validHome(tooLongSegment), false);

// Invalid Accent
const invalidAccent = structuredClone(data);
invalidAccent.segments[0].accent = 'invalid';
assert.equal(validHome(invalidAccent), false);

// Custom Color Validation
const validCustom = structuredClone(data);
validCustom.segments[0].accent = 'custom';
validCustom.segments[0].custom_color = '#FFB86C';
assert.equal(validHome(validCustom), true);

const invalidCustom1 = structuredClone(data);
invalidCustom1.segments[0].accent = 'custom';
invalidCustom1.segments[0].custom_color = 'FFB86C'; // missing hash
assert.equal(validHome(invalidCustom1), false);

const invalidCustom2 = structuredClone(data);
invalidCustom2.segments[0].accent = 'custom';
invalidCustom2.segments[0].custom_color = 'red'; // not hex
assert.equal(validHome(invalidCustom2), false);

const missingCustom = structuredClone(data);
missingCustom.segments[0].accent = 'custom';
missingCustom.segments[0].custom_color = null; // null custom color when accent is custom
assert.equal(validHome(missingCustom), false);

console.log('PASS: server action input validation, length limits, valid accents, structure.');
