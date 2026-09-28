import { readFile } from 'node:fs/promises';

export interface ManifestApi {
  properties: string[];
  actions: string[];
}

/** Reads now-ui.json and extracts the declared properties/actions for one component. */
export async function parseManifestComponent(
  manifestPath: string,
  componentName: string
): Promise<ManifestApi | null> {
  const raw = await readFile(manifestPath, 'utf8');
  const json = JSON.parse(raw);
  const comp = json?.components?.[componentName];
  if (!comp) return null;

  const properties = Array.isArray(comp.properties)
    ? comp.properties.map((p: any) => p?.name).filter(Boolean)
    : [];

  const actions = Array.isArray(comp.actions)
    ? comp.actions.map((a: any) => a?.name).filter(Boolean)
    : [];

  return { properties, actions };
}
