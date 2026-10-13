import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIconNames, searchIconNames, toDashCase } from './instanceIcons.js';

const bundle = `
  21554:e=>{e.exports= import("/uxasset/externals/@servicenow/now-icon/icons/abc.jsdbx") },
  26788:e=>{e.exports= import("/uxasset/externals/@servicenow/now-icon/icons/actionAiSparkle.jsdbx") },
  91848:e=>{e.exports= import("/uxasset/externals/@servicenow/now-icon/icons/star.jsdbx") },
  11111:e=>{e.exports= import("/uxasset/externals/@servicenow/now-icon/icons/starHalf.jsdbx") },
  22222:e=>{e.exports= import("/uxasset/externals/@servicenow/now-icon/icons/addressBook.jsdbx") },
  33333:e=>{e.exports= import("/uxasset/externals/@servicenow/now-icon/icons/star.jsdbx") }
`;

test('converts camelCase module names to dash-case', () => {
  assert.equal(toDashCase('addressBook'), 'address-book');
  assert.equal(toDashCase('actionAiSparkle'), 'action-ai-sparkle');
  assert.equal(toDashCase('star'), 'star');
});

test('parses sorted, de-duplicated icon names from the bundle', () => {
  assert.deepEqual(parseIconNames(bundle), ['abc', 'action-ai-sparkle', 'address-book', 'star', 'star-half']);
});

test('ranks exact matches first and accepts variant suffixes', () => {
  const names = parseIconNames(bundle);

  const plain = searchIconNames(names, { query: 'star' });
  assert.deepEqual(plain.names, ['star', 'star-half']);
  assert.equal(plain.exactMatch, true);

  const suffixed = searchIconNames(names, { query: 'star-outline' });
  assert.deepEqual(suffixed.names, ['star', 'star-half']);
  assert.equal(suffixed.exactMatch, true);
});

test('matches multi-word queries, applies limit, and reports non-exact queries', () => {
  const names = parseIconNames(bundle);

  const words = searchIconNames(names, { query: 'book address' });
  assert.deepEqual(words.names, ['address-book']);
  assert.equal(words.exactMatch, false);

  const limited = searchIconNames(names, { limit: 2 });
  assert.deepEqual(limited.names, ['abc', 'action-ai-sparkle']);
  assert.equal(limited.totalMatches, 5);

  assert.equal(searchIconNames(names, { query: 'zzz' }).names.length, 0);
});
