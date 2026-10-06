import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { recommendInstanceComponents } from '../lib/instanceCatalog.js';

export function registerRecommendInstanceComponents(server: McpServer) {
  server.tool(
    'recommend_instance_components',
    'Recommends likely HDS platform components from a curated registry, using live ServiceNow instance metadata when available for props and dispatched events. ' +
      'Use this before inventing a custom component when an existing platform component may already fit.',
    {
      useCase: z.string().optional().describe('Short description of the UI need, such as "button for launching a modal".'),
      desiredProperties: z.array(z.string()).optional().describe('Property names that the component should expose.'),
      desiredEvents: z.array(z.string()).optional().describe('Dispatched event names the component should expose.'),
      limit: z.number().int().min(1).max(20).optional().describe('Maximum number of recommendations to return. Defaults to 5.')
    },
    async ({ useCase, desiredProperties, desiredEvents, limit }) => {
      try {
        const results = await recommendInstanceComponents({
          useCase,
          desiredProperties,
          desiredEvents,
          limit
        });

        if (results.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No instance components stood out for the supplied use case.' }]
          };
        }

        const lines: string[] = ['Recommended HDS components:'];
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

        lines.push('', 'Inspect a candidate with get_component_api before adding it to your project.');

        return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
      } catch (err) {
        return { isError: true, content: [{ type: 'text' as const, text: (err as Error).message }] };
      }
    }
  );
}