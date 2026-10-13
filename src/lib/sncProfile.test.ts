import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSncProfileAuth } from './sncProfile.js';

const config = JSON.stringify({
  profiles: {
    default: { host: 'https://dev.service-now.com/', username: 'admin', loginmethod: 'basic' },
    other: { host: 'https://other.service-now.com', username: 'bob', loginmethod: 'basic' },
    sso: { host: 'https://sso.service-now.com', username: 'sue', loginmethod: 'oauth' }
  }
});

const deps = (passwords: Record<string, string> = { default: '{"password":"s3cret"}', other: '{"password":"pw2"}' }) => ({
  platform: 'darwin' as const,
  readConfigFile: () => config,
  readKeychainPassword: (profile: string) => {
    if (!(profile in passwords)) throw new Error('The specified item could not be found in the keychain.');
    return passwords[profile];
  }
});

test('resolves host, username and keychain password for a profile', () => {
  assert.deepEqual(resolveSncProfileAuth('default', deps()), {
    baseUrl: 'https://dev.service-now.com',
    user: 'admin',
    password: 's3cret',
    profile: 'default'
  });
  assert.equal(resolveSncProfileAuth('other', deps()).password, 'pw2');
});

test('rejects unknown profiles, non-basic login methods and non-macOS platforms', () => {
  assert.throws(() => resolveSncProfileAuth('missing', deps()), /not found.*available: default, other, sso/);
  assert.throws(() => resolveSncProfileAuth('sso', deps()), /"oauth" login method/);
  assert.throws(() => resolveSncProfileAuth('default', { ...deps(), platform: 'linux' }), /only supported on macOS/);
});

test('reports keychain failures and malformed keychain values without leaking them', () => {
  assert.throws(() => resolveSncProfileAuth('default', deps({})), /Could not read the password.*keychain/);
  assert.throws(() => resolveSncProfileAuth('default', deps({ default: 'not json' })), /not the expected/);
  assert.throws(() => resolveSncProfileAuth('default', deps({ default: '{"password":""}' })), /does not contain a "password"/);
  assert.throws(() => resolveSncProfileAuth('default', deps({ default: 'oops-s3cret' })), (error: Error) => !error.message.includes('s3cret'));
});
