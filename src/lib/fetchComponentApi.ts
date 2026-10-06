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
  deprecated: boolean;
  properties: ComponentApiProperty[];
  actions: ComponentApiAction[];
}
import { fetchInstanceComponentByTag } from './instanceCatalog.js';

/**
 * Compatibility wrapper around the reusable instance catalog. New discovery flows
 * should prefer instanceCatalog helpers directly.
 */
export async function fetchComponentApi(componentTag: string): Promise<InstanceComponentApi | null> {
  return fetchInstanceComponentByTag(componentTag);
}
