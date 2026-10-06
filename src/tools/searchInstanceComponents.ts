import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchInstanceComponents } from '../lib/instanceCatalog.js';

export function registerSearchInstanceComponents(server: McpServer) {
  server.tool(
    'search_instance_components',
    'Searches a curated HDS component registry and enriches matches with live ServiceNow instance metadata when available. ' +
      'Use this when an agent needs to discover likely platform components before choosing a dependency or writing custom UI code.',
    {
      query: z.string().optional().describe('Free-text query to match against component tags and known properties/events.'),
      propertyName: z.string().optional().describe('Require components that expose a specific property name.'),
      actionName: z.string().optional().describe('Require components that dispatch a specific event/action name.'),
      limit: z.number().int().min(1).max(100).optional().describe('Maximum number of results to return. Defaults to 25.')
    },
    async ({ query, propertyName, actionName, limit }) => {
      try {
        const results = await searchInstanceComponents({ query, propertyName, actionName, limit });

        if (results.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No instance components matched the supplied search criteria.' }]
          };
        }

        const lines: string[] = ['Matching HDS components:'];
        for (const result of results) {
          const component = result.component;
          const metadata = component.sysId
            ? `${component.properties.length} properties, ${component.actions.length} events`
            : 'live instance metadata unavailable';
          lines.push(
            `- ${component.tag} — ${metadata}` +
              (result.reasons.length > 0 ? ` | ${result.reasons.join('; ')}` : '')
          );
        }

        lines.push('', 'Use get_component_api with a tag from this list to inspect live property and event details from the instance.');

        return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
      } catch (err) {
        return { isError: true, content: [{ type: 'text' as const, text: (err as Error).message }] };
      }
    }
  );
}