import { getInstanceConfig, instanceGetText } from './instanceClient.js';

// The now-icon package registers one lazy-loaded module per icon, e.g.
//   import("/uxasset/externals/@servicenow/now-icon/icons/starHalf.jsdbx")
// so the bundle served by the instance is the authoritative list of icon base names.
const ICON_BUNDLE_PATH = '/uxasset/externals/@servicenow/now-icon/index.jsdbx';
const ICON_FILE_PATTERN = /now-icon\/icons\/([A-Za-z0-9]+)\.jsdbx/g;
const ICON_CACHE_TTL_MS = 10 * 60_000;
const VARIANT_SUFFIX = /-(outline|fill)$/;

export interface IconSearchOptions {
  query?: string;
  limit?: number;
}

export interface IconSearchResult {
  /** Base icon names (dash-case, no -outline/-fill suffix), best match first. */
  names: string[];
  /** Number of matches before `limit` was applied. */
  totalMatches: number;
  /** Number of icons known to the instance. */
  totalIcons: number;
  /** True when the query (ignoring any -outline/-fill suffix) is exactly an icon name. */
  exactMatch: boolean;
}

let iconCache: { baseUrl: string; expiresAt: number; value: Promise<string[]> } | undefined;

/** camelCase module name -> dash-case icon name, e.g. "addressBook" -> "address-book". */
export function toDashCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Extracts the sorted, de-duplicated dash-case icon names from the now-icon bundle source. */
export function parseIconNames(bundleSource: string): string[] {
  const names = new Set<string>();
  for (const match of bundleSource.matchAll(ICON_FILE_PATTERN)) {
    names.add(toDashCase(match[1]));
  }
  return [...names].sort();
}

export async function fetchInstanceIconNames(): Promise<string[]> {
  const config = getInstanceConfig();
  const now = Date.now();
  if (iconCache && iconCache.baseUrl === config.baseUrl && iconCache.expiresAt > now) {
    return iconCache.value;
  }

  const value = instanceGetText(config, ICON_BUNDLE_PATH).then(source => {
    const names = parseIconNames(source);
    if (names.length === 0) {
      throw new Error(
        `No icons were found in ${ICON_BUNDLE_PATH} on ${config.baseUrl}; the now-icon bundle format may have changed.`
      );
    }
    return names;
  });
  iconCache = { baseUrl: config.baseUrl, expiresAt: now + ICON_CACHE_TTL_MS, value };
  // Don't cache failures.
  value.catch(() => {
    if (iconCache?.value === value) iconCache = undefined;
  });
  return value;
}

function scoreIcon(name: string, normalizedQuery: string, tokens: string[]): number {
  if (name === normalizedQuery) return 100;
  const words = name.split('-');
  if (name.startsWith(normalizedQuery)) return 80;
  if (tokens.every(token => words.includes(token))) return 70;
  if (tokens.every(token => words.some(word => word.startsWith(token)))) return 50;
  if (tokens.every(token => name.includes(token))) return 30;
  return 0;
}

/** Ranks icon names against a free-text query. An empty query returns every icon alphabetically. */
export function searchIconNames(allNames: string[], options: IconSearchOptions = {}): IconSearchResult {
  const limit = options.limit ?? 50;
  const normalizedQuery = (options.query ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(VARIANT_SUFFIX, '');
  const tokens = normalizedQuery.split('-').filter(Boolean);

  if (tokens.length === 0) {
    return { names: allNames.slice(0, limit), totalMatches: allNames.length, totalIcons: allNames.length, exactMatch: false };
  }

  const scored = allNames
    .map(name => ({ name, score: scoreIcon(name, normalizedQuery, tokens) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return {
    names: scored.slice(0, limit).map(entry => entry.name),
    totalMatches: scored.length,
    totalIcons: allNames.length,
    exactMatch: allNames.includes(normalizedQuery)
  };
}

export async function searchInstanceIcons(options: IconSearchOptions = {}): Promise<IconSearchResult> {
  return searchIconNames(await fetchInstanceIconNames(), options);
}
