import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export interface SncProfileAuth {
  baseUrl: string;
  user: string;
  password: string;
  profile: string;
}

export interface SncProfileDeps {
  platform: NodeJS.Platform;
  readConfigFile: () => string;
  readKeychainPassword: (profile: string) => string;
}

const KEYCHAIN_SERVICE = 'snc';

const defaultDeps: SncProfileDeps = {
  platform: process.platform,
  readConfigFile: () => readFileSync(join(homedir(), '.snc', 'config.json'), 'utf8'),
  // The snc CLI stores one generic-password item per profile: service "snc", account = profile name,
  // value = {"password":"..."}. execFileSync (no shell) keeps the profile name from being interpreted.
  readKeychainPassword: profile =>
    execFileSync('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-a', profile, '-w'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 15_000
    })
};

/**
 * Resolves instance credentials from an `snc configure profile` profile: host and username come from
 * ~/.snc/config.json and the password from the macOS Keychain. Only basic-auth profiles are supported.
 * Throws a descriptive Error when the profile cannot be used.
 */
export function resolveSncProfileAuth(profile: string, deps: Partial<SncProfileDeps> = {}): SncProfileAuth {
  const { platform, readConfigFile, readKeychainPassword } = { ...defaultDeps, ...deps };

  if (platform !== 'darwin') {
    throw new Error('Using an snc profile for credentials is only supported on macOS (it reads the macOS Keychain).');
  }

  let config: { profiles?: Record<string, { host?: string; username?: string; loginmethod?: string }> };
  try {
    config = JSON.parse(readConfigFile());
  } catch (error) {
    throw new Error(`Could not read the snc config (~/.snc/config.json): ${(error as Error).message}`);
  }

  const entry = config.profiles?.[profile];
  if (!entry) {
    const known = Object.keys(config.profiles ?? {});
    throw new Error(
      `snc profile "${profile}" was not found in ~/.snc/config.json` +
        (known.length > 0 ? ` (available: ${known.join(', ')}).` : '.')
    );
  }
  if (entry.loginmethod && entry.loginmethod !== 'basic') {
    throw new Error(
      `snc profile "${profile}" uses the "${entry.loginmethod}" login method; only "basic" profiles are supported.`
    );
  }
  if (!entry.host || !entry.username) {
    throw new Error(`snc profile "${profile}" is missing a host or username in ~/.snc/config.json.`);
  }

  let raw: string;
  try {
    raw = readKeychainPassword(profile);
  } catch (error) {
    throw new Error(
      `Could not read the password for snc profile "${profile}" from the macOS Keychain ` +
        `(service "${KEYCHAIN_SERVICE}", account "${profile}"): ${(error as Error).message.split('\n')[0]}`
    );
  }

  // Never surface parse errors or the raw value: JSON.parse messages quote the input.
  let password: unknown;
  try {
    password = JSON.parse(raw).password;
  } catch {
    throw new Error(`The Keychain item for snc profile "${profile}" is not the expected {"password": "..."} JSON.`);
  }
  if (typeof password !== 'string' || password === '') {
    throw new Error(`The Keychain item for snc profile "${profile}" does not contain a "password" value.`);
  }

  return { baseUrl: entry.host.replace(/\/+$/, ''), user: entry.username, password, profile };
}
