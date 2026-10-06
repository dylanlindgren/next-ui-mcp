import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchComponentApi } from '../lib/fetchComponentApi.js';
import { isKnownHdsComponentTag } from '../lib/hdsComponentRegistry.js';

export function registerGetComponentApi(server: McpServer) {
  server.tool(
    'get_component_api',
    'Looks up the REAL, current API (properties and dispatched actions/events) of a ' +
      'Now/Next Experience UI Framework component — e.g. now-button, now-input, now-select — ' +
      "as it actually exists on the user's own configured ServiceNow instance. The lookup " +
      'uses sys_ux_lib_component for the tag and the related sys_ux_macroponent row through ' +
      'root_component to read the component\'s actual props and dispatched_events, which may be ' +
      'newer or richer than what is published to public npm. Call this BEFORE writing custom ' +
      'markup/logic that duplicates something a platform component already provides, so the real ' +
      'component and its actual props/events get used instead of a hand-rolled equivalent. Use ' +
      'search_instance_components first if you do not already know the exact tag. Requires the ' +
      'target instance to be configured via environment variables (NEXT_UI_INSTANCE_URL and ' +
      'credentials).',
    {
      componentTag: z.string().describe('The component\'s HTML tag name, e.g. "now-button" or "now-input".')
    },
    async ({ componentTag }: { componentTag: string }) => {
      try {
        const api = await fetchComponentApi(componentTag);

        if (!api) {
          const knownTag = isKnownHdsComponentTag(componentTag);
          return {
            content: [
              {
                type: 'text' as const,
                text: knownTag
                  ? `The curated HDS registry includes "${componentTag}", but no live component metadata was found for that tag on the configured instance.`
                  : `No curated HDS component tagged "${componentTag}" is known to this server.`
              }
            ]
          };
        }

        const lines: string[] = [];
        lines.push(`Component: ${api.tag}${api.deprecated ? ' (DEPRECATED)' : ''}`, '');

        lines.push('Properties:');
        if (api.properties.length === 0) {
          lines.push('  (none registered)');
        } else {
          for (const p of api.properties) {
            const type = p.type ? `: ${p.type}` : '';
            const desc = p.description ? ` — ${p.description}` : '';
            lines.push(`  - ${p.name}${type}${desc}`);
          }
        }

        lines.push('', 'Actions/events dispatched:');
        if (api.actions.length === 0) {
          lines.push('  (none registered)');
        } else {
          for (const a of api.actions) {
            const desc = a.description ? ` — ${a.description}` : '';
            lines.push(`  - ${a.name}${desc}`);
          }
        }

        return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
      } catch (err) {
        return { isError: true, content: [{ type: 'text' as const, text: (err as Error).message }] };
      }
    }
  );
}
