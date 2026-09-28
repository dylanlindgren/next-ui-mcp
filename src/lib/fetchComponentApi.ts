import { getInstanceConfig, tableApiGet } from './instanceClient.js';

export interface ComponentApiProperty {
  name: string;
  type?: string;
  description?: string;
  source: 'attr' | 'prop';
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

function displayValue(field: unknown): string | undefined {
  if (field == null || field === '') return undefined;
  if (typeof field === 'object') return (field as { display_value?: string }).display_value;
  return String(field);
}

/**
 * Looks up a component's REAL, current API on the user's own configured ServiceNow
 * instance — sys_ux_lib_component plus its _attr / _prop / _action children — rather
 * than from any bundled/static dataset. Different components store their property
 * declarations in different child tables (sys_ux_lib_component_attr for
 * dictionary-style "core" components like now-button, sys_ux_lib_component_prop for
 * others), so both are checked and merged.
 */
export async function fetchComponentApi(componentTag: string): Promise<InstanceComponentApi | null> {
  const config = getInstanceConfig();

  const components = await tableApiGet(config, 'sys_ux_lib_component', {
    sysparm_query: `tag=${componentTag}`,
    sysparm_fields: 'sys_id,tag,deprecated',
    sysparm_limit: '1'
  });

  const component = components[0];
  if (!component) return null;

  const sysId = component.sys_id;

  const [attrs, props, actions] = await Promise.all([
    tableApiGet(config, 'sys_ux_lib_component_attr', {
      sysparm_query: `model=${sysId}^active=true`,
      sysparm_fields: 'element,internal_type,description',
      sysparm_display_value: 'true',
      sysparm_limit: '200'
    }),
    tableApiGet(config, 'sys_ux_lib_component_prop', {
      sysparm_query: `host=${sysId}`,
      sysparm_fields: 'name,description',
      sysparm_limit: '200'
    }),
    tableApiGet(config, 'sys_ux_lib_component_action', {
      sysparm_query: `publisher=${sysId}`,
      sysparm_fields: 'name,description',
      sysparm_limit: '200'
    })
  ]);

  const properties: ComponentApiProperty[] = [];
  for (const a of attrs as any[]) {
    const name = displayValue(a.element);
    if (!name) continue;
    properties.push({ name, type: displayValue(a.internal_type), description: displayValue(a.description), source: 'attr' });
  }
  for (const p of props as any[]) {
    const name = displayValue(p.name);
    if (!name) continue;
    properties.push({ name, description: displayValue(p.description), source: 'prop' });
  }

  const actionList: ComponentApiAction[] = [];
  for (const a of actions as any[]) {
    const name = displayValue(a.name);
    if (!name) continue;
    actionList.push({ name, description: displayValue(a.description) });
  }

  return {
    tag: component.tag,
    sysId,
    deprecated: component.deprecated === 'true' || component.deprecated === true,
    properties,
    actions: actionList
  };
}
