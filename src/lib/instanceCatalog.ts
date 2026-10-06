import { getHdsComponent } from './hdsComponentRegistry.js';
import { getInstanceConfig, tableApiGet } from './instanceClient.js';

export interface ComponentApiProperty {
  name: string;
  type?: string;
  description?: string;
  source: 'attr' | 'prop' | 'macroponent';
}

export interface ComponentApiAction {
  name: string;
  description?: string;
}

export interface InstanceComponentApi {
  tag: string;
  sysId: string;
  properties: ComponentApiProperty[];
  actions: ComponentApiAction[];
}

export interface InstanceComponentCatalogEntry extends InstanceComponentApi {}

export interface InstanceCatalogSearchOptions {
  query?: string;
  propertyName?: string;
  actionName?: string;
  limit?: number;
}

export interface InstanceComponentSearchResult {
  component: InstanceComponentCatalogEntry;
  score: number;
  reasons: string[];
}

export interface InstanceComponentRecommendationInput {
  useCase?: string;
  desiredProperties?: string[];
  desiredEvents?: string[];
  limit?: number;
}

const CATALOG_CACHE_TTL_MS = 60_000;
const COMPONENT_PAGE_SIZE = 1000;
const CHILD_PAGE_SIZE = 10000;
const SYS_ID_QUERY_CHUNK_SIZE = 25;
const EVENT_QUERY_CHUNK_SIZE = 50;

// Discovers every non-deprecated public HDS component on the instance directly, rather than
// only the tags already known to the curated HDS_COMPONENTS registry below. The registry still
// supplies package names and search terms for tags it knows, but it no longer gates which
// components the live catalog can see.
const DISCOVERY_QUERY = 'deprecated=false^ORdeprecatedISNULL^tagSTARTSWITHnow';

type CacheEntry = {
  expiresAt: number;
  value: Promise<InstanceComponentCatalogEntry[]>;
};

const catalogCache = new Map<string, CacheEntry>();

function displayValue(field: unknown): string | undefined {
  if (field == null || field === '') return undefined;
  if (typeof field === 'object') return (field as { display_value?: string }).display_value;
  return String(field);
}

function rawValue(field: unknown): string | undefined {
  if (field == null || field === '') return undefined;
  if (typeof field === 'object') return (field as { value?: string }).value;
  return String(field);
}

function parseJsonArray(value: string | undefined): any[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseGlideList(value: string | undefined): string[] {
  return value
    ? value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function dedupeProperties(properties: ComponentApiProperty[]): ComponentApiProperty[] {
  const seen = new Set<string>();
  const result: ComponentApiProperty[] = [];

  for (const property of properties) {
    const key = `${property.name}:${property.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(property);
  }

  return result.sort((left, right) => left.name.localeCompare(right.name));
}

function dedupeActions(actions: ComponentApiAction[]): ComponentApiAction[] {
  const seen = new Set<string>();
  const result: ComponentApiAction[] = [];

  for (const action of actions) {
    const key = action.name;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(action);
  }

  return result.sort((left, right) => left.name.localeCompare(right.name));
}

async function tableApiGetAll(
  table: string,
  params: Record<string, string>,
  pageSize: number
): Promise<any[]> {
  const config = getInstanceConfig();
  const rows: any[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const page = await tableApiGet(config, table, {
      ...params,
      sysparm_limit: String(pageSize),
      sysparm_offset: String(offset)
    });

    rows.push(...page);

    if (page.length < pageSize) {
      return rows;
    }
  }
}

async function loadCatalog(): Promise<InstanceComponentCatalogEntry[]> {
  const componentRows = await tableApiGetAll(
    'sys_ux_lib_component',
    {
      sysparm_query: DISCOVERY_QUERY,
      sysparm_fields: 'sys_id,tag',
      sysparm_display_value: 'all'
    },
    COMPONENT_PAGE_SIZE
  );

  const componentMap = new Map<string, InstanceComponentCatalogEntry>();
  const tagBySysId = new Map<string, string>();
  const componentSysIds: string[] = [];

  for (const component of componentRows as any[]) {
    const sysId = rawValue(component.sys_id);
    const tag = displayValue(component.tag);
    if (!sysId || !tag || componentMap.has(tag)) continue;

    componentMap.set(tag, {
      tag,
      sysId,
      properties: [],
      actions: []
    });
    tagBySysId.set(sysId, tag);
    componentSysIds.push(sysId);
  }

  const macroponents = componentSysIds.length
    ? (
        await Promise.all(
          chunkArray(componentSysIds, SYS_ID_QUERY_CHUNK_SIZE).map((sysIdChunk) =>
            tableApiGetAll(
              'sys_ux_macroponent',
              {
                sysparm_query: `root_componentIN${sysIdChunk.join(',')}`,
                sysparm_fields: 'root_component,props,dispatched_events',
                sysparm_display_value: 'all'
              },
              CHILD_PAGE_SIZE
            )
          )
        )
      ).flat()
    : [];

  const eventIds = new Set<string>();
  for (const macroponent of macroponents as any[]) {
    for (const eventId of parseGlideList(rawValue(macroponent.dispatched_events))) {
      eventIds.add(eventId);
    }
  }

  const events = eventIds.size
    ? (
        await Promise.all(
          chunkArray([...eventIds], 50).map((eventChunk) =>
            tableApiGetAll(
              'sys_ux_event',
              {
                sysparm_query: `sys_idIN${eventChunk.join(',')}`,
                sysparm_fields: 'sys_id,event_name,label,description',
                sysparm_display_value: 'all'
              },
              CHILD_PAGE_SIZE
            )
          )
        )
      ).flat()
    : [];
  const eventMap = new Map<string, any>();
  for (const event of events as any[]) {
    const sysId = rawValue(event.sys_id);
    if (!sysId) continue;
    eventMap.set(sysId, event);
  }

  for (const macroponent of macroponents as any[]) {
    const sysId = rawValue(macroponent.root_component);
    if (!sysId) continue;

    const tag = tagBySysId.get(sysId);
    const component = tag ? componentMap.get(tag) : undefined;
    if (!component) continue;

    for (const prop of parseJsonArray(rawValue(macroponent.props))) {
      const name = typeof prop?.name === 'string' ? prop.name : undefined;
      if (!name) continue;

      const type =
        typeof prop?.fieldType === 'string'
          ? prop.fieldType
          : typeof prop?.valueType === 'string'
            ? prop.valueType
            : undefined;

      component.properties.push({
        name,
        type,
        description: typeof prop?.description === 'string' ? prop.description : undefined,
        source: 'macroponent'
      });
    }

    for (const eventId of parseGlideList(rawValue(macroponent.dispatched_events))) {
      const event = eventMap.get(eventId);
      if (!event) continue;

      const eventName = displayValue(event.event_name) ?? displayValue(event.label) ?? eventId;
      const descriptionParts = [displayValue(event.label), displayValue(event.description)].filter(
        Boolean
      ) as string[];

      component.actions.push({
        name: eventName,
        description: descriptionParts.length > 0 ? descriptionParts.join(' — ') : undefined
      });
    }
  }

  return [...componentMap.values()]
    .map((component) => ({
      ...component,
      properties: dedupeProperties(component.properties),
      actions: dedupeActions(component.actions)
    }))
    .sort((left, right) => left.tag.localeCompare(right.tag));
}

export async function fetchInstanceComponentCatalog(forceRefresh = false): Promise<InstanceComponentCatalogEntry[]> {
  const { baseUrl } = getInstanceConfig();
  const cacheKey = baseUrl;
  const cached = catalogCache.get(cacheKey);
  const now = Date.now();

  if (!forceRefresh && cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = loadCatalog();
  catalogCache.set(cacheKey, { expiresAt: now + CATALOG_CACHE_TTL_MS, value });

  try {
    return await value;
  } catch (error) {
    if (catalogCache.get(cacheKey)?.value === value) {
      catalogCache.delete(cacheKey);
    }
    throw error;
  }
}

export async function fetchInstanceComponentByTag(componentTag: string): Promise<InstanceComponentCatalogEntry | null> {
  const normalizedTag = normalizeToken(componentTag);
  const catalog = await fetchInstanceComponentCatalog();
  const component = catalog.find((entry) => normalizeToken(entry.tag) === normalizedTag) ?? null;
  if (!component || !component.sysId) {
    return null;
  }

  return component;
}

function buildMatchText(component: InstanceComponentCatalogEntry): string[] {
  const registeredComponent = getHdsComponent(component.tag);

  return [
    component.tag,
    ...(registeredComponent?.searchTerms ?? []),
    ...component.properties.map((property) => property.name),
    ...component.actions.map((action) => action.name)
  ];
}

function scoreComponent(
  component: InstanceComponentCatalogEntry,
  options: InstanceCatalogSearchOptions
): InstanceComponentSearchResult | null {
  let score = 0;
  const reasons: string[] = [];
  const haystack = buildMatchText(component);

  if (options.query) {
    const normalizedQuery = normalizeToken(options.query);
    const queryTokens = tokenize(options.query);

    if (normalizeToken(component.tag) === normalizedQuery) {
      score += 20;
      reasons.push(`exact tag match for "${options.query}"`);
    } else if (normalizeToken(component.tag).includes(normalizedQuery)) {
      score += 12;
      reasons.push(`tag contains "${options.query}"`);
    }

    const tokenMatches = queryTokens.filter((token) => haystack.some((value) => normalizeToken(value).includes(token)));
    if (tokenMatches.length > 0) {
      score += tokenMatches.length * 3;
      reasons.push(`matched query tokens: ${tokenMatches.join(', ')}`);
    }
  }

  if (options.propertyName) {
    const matchedProperty = component.properties.find(
      (property) => normalizeToken(property.name) === normalizeToken(options.propertyName as string)
    );
    if (!matchedProperty) return null;
    score += 15;
    reasons.push(`supports property "${matchedProperty.name}"`);
  }

  if (options.actionName) {
    const matchedAction = component.actions.find(
      (action) => normalizeToken(action.name) === normalizeToken(options.actionName as string)
    );
    if (!matchedAction) return null;
    score += 15;
    reasons.push(`dispatches event "${matchedAction.name}"`);
  }

  if (!options.query && !options.propertyName && !options.actionName) {
    score = 1;
  }

  if (score === 0 && (options.query || options.propertyName || options.actionName)) {
    return null;
  }

  return { component, score, reasons };
}

export async function searchInstanceComponents(
  options: InstanceCatalogSearchOptions = {}
): Promise<InstanceComponentSearchResult[]> {
  const catalog = await fetchInstanceComponentCatalog();
  const results = catalog
    .map((component) => scoreComponent(component, options))
    .filter((result): result is InstanceComponentSearchResult => result != null)
    .sort((left, right) => right.score - left.score || left.component.tag.localeCompare(right.component.tag));

  const limit = options.limit ?? 25;
  return results.slice(0, limit);
}

export async function recommendInstanceComponents(
  input: InstanceComponentRecommendationInput
): Promise<InstanceComponentSearchResult[]> {
  const catalog = await fetchInstanceComponentCatalog();
  const desiredProperties = (input.desiredProperties ?? []).map(normalizeToken);
  const desiredEvents = (input.desiredEvents ?? []).map(normalizeToken);
  const useCaseTokens = tokenize(input.useCase ?? '');

  const results = catalog
    .map((component) => {
      let score = 0;
      const reasons: string[] = [];

      for (const property of component.properties) {
        if (desiredProperties.includes(normalizeToken(property.name))) {
          score += 10;
          reasons.push(`has property "${property.name}"`);
        }
      }

      for (const action of component.actions) {
        if (desiredEvents.includes(normalizeToken(action.name))) {
          score += 10;
          reasons.push(`dispatches "${action.name}"`);
        }
      }

      if (useCaseTokens.length > 0) {
        const text = buildMatchText(component).map(normalizeToken);
        const matchedTokens = useCaseTokens.filter((token) => text.some((value) => value.includes(token)));
        if (matchedTokens.length > 0) {
          score += matchedTokens.length * 2;
          reasons.push(`matched use-case tokens: ${matchedTokens.join(', ')}`);
        }
      }

      if (desiredProperties.length === 0 && desiredEvents.length === 0 && useCaseTokens.length === 0) {
        score = 1;
      }

      return { component, score, reasons };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.component.tag.localeCompare(right.component.tag));

  const limit = input.limit ?? 5;
  return results.slice(0, limit);
}