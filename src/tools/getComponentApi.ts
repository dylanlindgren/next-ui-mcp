import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchComponentApi } from '../lib/fetchComponentApi.js';

export function registerGetComponentApi(server: McpServer) {
  server.tool(
    'get_component_api',
    'Looks up the REAL, current API (properties and dispatched actions/events) of a ' +
      'Now/Next Experience UI Framework component — e.g. now-button, now-input, now-select — ' +
      "as it actually exists on the user's own configured ServiceNow instance " +
      '(sys_ux_lib_component and related tables), which may be newer or richer than what is ' +
      'published to public npm. Call this BEFORE writing custom markup/logic that duplicates ' +
      'something a platform component already provides, so the real component and its actual ' +
      'props/events get used instead of a hand-rolled equivalent. Requires the target instance ' +
      'to be configured via environment variables (NEXT_UI_INSTANCE_URL and credentials).',
    {
      componentTag: z.string().describe('The component\'s HTML tag name, e.g. "now-button" or "now-input".')
    },
    async ({ componentTag }: { componentTag: string }) => {
      try {
        const api = await fetchComponentApi(componentTag);

        if (!api) {
          return {
            isError: true,
            content: [
              { type: 'text' as const, text: `No component tagged "${componentTag}" was found on the configured instance.` }
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
