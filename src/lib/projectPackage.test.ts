import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyzeProjectDependencies, packageNameForTag } from './projectPackage.js';

test('packageNameForTag resolves now-card child tags to the shared package', () => {
  assert.equal(packageNameForTag('now-card-header'), '@servicenow/now-card');
  assert.equal(packageNameForTag('now-card'), '@servicenow/now-card');
});

test('packageNameForTag does not invent package names for unknown tags', () => {
  assert.equal(packageNameForTag('now-card-header-extra'), '');
  assert.equal(packageNameForTag('now-unknown-thing'), '');
});

test('dependency analysis recognizes instance-backed ui-mega without installed packages or a lockfile', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'next-ui-dependencies-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const packageJsonPath = join(directory, 'package.json');
  await writeFile(packageJsonPath, JSON.stringify({
    optionalDependencies: {
      '@servicenow/ui-mega': 'instance',
      '@servicenow/now-card': 'instance'
    },
    devDependencies: { storybook: '^10.6.2' }
  }));

  const analysis = await analyzeProjectDependencies(packageJsonPath, ['@servicenow/ui-mega', 'now-card']);

  assert.deepEqual(analysis.instanceOptionalDependencies, ['@servicenow/now-card', '@servicenow/ui-mega']);
  assert.deepEqual(analysis.regularServiceNowDependencies, []);
  assert.deepEqual(analysis.missingInstanceDependencies, []);
  assert.deepEqual(analysis.shouldMoveToInstanceOptional, []);
});

test('dependency analysis flags registry and missing ui-mega declarations for planned runtime shims', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'next-ui-dependencies-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const packageJsonPath = join(directory, 'package.json');

  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    await writeFile(packageJsonPath, JSON.stringify({
      [section]: { '@servicenow/ui-mega': '^1.0.0' }
    }));
    const analysis = await analyzeProjectDependencies(packageJsonPath, ['@servicenow/ui-mega']);
    assert.deepEqual(analysis.regularServiceNowDependencies, [
      { name: '@servicenow/ui-mega', version: '^1.0.0', section }
    ]);
    assert.deepEqual(analysis.missingInstanceDependencies, ['@servicenow/ui-mega']);
    assert.deepEqual(analysis.shouldMoveToInstanceOptional, ['@servicenow/ui-mega']);
  }

  await writeFile(packageJsonPath, '{}');
  const analysis = await analyzeProjectDependencies(packageJsonPath, ['@servicenow/ui-mega']);
  assert.deepEqual(analysis.missingInstanceDependencies, ['@servicenow/ui-mega']);
  assert.deepEqual(analysis.shouldMoveToInstanceOptional, []);
});
