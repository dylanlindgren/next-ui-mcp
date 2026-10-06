import test from 'node:test';
import assert from 'node:assert/strict';
import { packageNameForTag } from './projectPackage.js';

test('packageNameForTag resolves now-card child tags to the shared package', () => {
  assert.equal(packageNameForTag('now-card-header'), '@servicenow/now-card');
  assert.equal(packageNameForTag('now-card'), '@servicenow/now-card');
});

test('packageNameForTag does not invent package names for unknown tags', () => {
  assert.equal(packageNameForTag('now-card-header-extra'), '');
  assert.equal(packageNameForTag('now-unknown-thing'), '');
});
