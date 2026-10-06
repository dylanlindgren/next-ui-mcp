import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { recommendInstanceComponents } from '../lib/instanceCatalog.js';

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function countMatches(actual: string[], desired: string[]): number {
  const normalizedActual = actual.map(normalizeToken);
  return desired.filter((value) => normalizedActual.includes(normalizeToken(value))).length;
}

function recommendationText(options: {
  desiredProperties: string[];
  desiredEvents: string[];
  matchedProperties: number;
  matchedEvents: number;
  resultCount: number;
}): string {
  const { desiredProperties, desiredEvents, matchedProperties, matchedEvents, resultCount } = options;
  const wantsProperties = desiredProperties.length > 0;
  const wantsEvents = desiredEvents.length > 0;
  const allPropertiesMatched = !wantsProperties || matchedProperties === desiredProperties.length;
  const allEventsMatched = !wantsEvents || matchedEvents === desiredEvents.length;

  if (resultCount === 0) {
    return 'No strong HDS match was found. Building a custom component is probably justified unless you already know a platform component to wrap.';
  }

  if (allPropertiesMatched && allEventsMatched) {
    return 'An existing HDS component looks like a direct fit. Prefer using it first before building a custom wrapper or custom component.';
  }

  if (matchedProperties > 0 || matchedEvents > 0) {
    return 'A partial HDS fit exists. Prefer composition or a thin wrapper around the best candidate instead of building everything from scratch.';
  }

  return 'Candidates exist, but none match the requested API closely. Build custom only if the missing behavior cannot be achieved through composition.';
}

export function registerEvaluatePlatformComponentFit(server: McpServer) {
  server.tool(
    'evaluate_platform_component_fit',
    'Evaluates whether an HDS platform component should be used directly, wrapped/composed, or replaced with a custom component. MUST prefer existing platform components such as now-card before building a custom card or custom primitive. Use this before scaffolding new UI from scratch and before inventing custom wrappers around functionality the instance already exposes. For any styled card, panel, or container, the evaluation must consider the platform component first and then require a separate .scss file plus a styles property on the custom element if custom UI is still necessary. When the chosen platform component is instance-backed, the project should declare it in package.json under optionalDependencies with version "instance".',
    {
      useCase: z.string().describe('Short description of the UI need, such as "inline label/value pair with tooltip".'),
      desiredProperties: z.array(z.string()).optional().describe('Optional list of properties the component should expose.'),
      desiredEvents: z.array(z.string()).optional().describe('Optional list of dispatched events the component should expose.')
    },
    async ({ useCase, desiredProperties, desiredEvents }) => {
      try {
        const results = await recommendInstanceComponents({
          useCase,
          desiredProperties,
          desiredEvents,
          limit: 5
        });

        const lines: string[] = [];
        const desiredProps = desiredProperties ?? [];
        const desiredEvts = desiredEvents ?? [];

        if (results.length === 0) {
          lines.push(
            'Assessment:',
            '  - No strong HDS candidates were found from the curated registry and live instance metadata.',
            '',
            'Recommendation:',
            '  - Building a custom component is likely justified.',
            '  - If you still suspect an HDS component exists, run search_instance_components with a narrower query.'
          );

          return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
        }

        const best = results[0].component;
        const matchedProperties = countMatches(
          best.properties.map((property) => property.name),
          desiredProps
        );
        const matchedEvents = countMatches(
          best.actions.map((action) => action.name),
          desiredEvts
        );

        lines.push('Assessment:');
        lines.push(`  - Best candidate: ${best.tag}`);
        lines.push(`  - Live metadata: ${best.sysId ? `${best.properties.length} properties, ${best.actions.length} events` : 'unavailable on configured instance'}`);
        if (desiredProps.length > 0) {
          lines.push(`  - Requested properties matched: ${matchedProperties}/${desiredProps.length}`);
        }
        if (desiredEvts.length > 0) {
          lines.push(`  - Requested events matched: ${matchedEvents}/${desiredEvts.length}`);
        }

        lines.push('', 'Top candidates:');
        for (const result of results) {
          const metadata = result.component.sysId
            ? `${result.component.properties.length} properties, ${result.component.actions.length} events`
            : 'live instance metadata unavailable';
          lines.push(
            `  - ${result.component.tag} — ${metadata}` +
              (result.reasons.length > 0 ? ` | ${result.reasons.join('; ')}` : '')
          );
        }

        lines.push('', 'Recommendation:');
        lines.push(
          `  - ${recommendationText({
            desiredProperties: desiredProps,
            desiredEvents: desiredEvts,
            matchedProperties,
            matchedEvents,
            resultCount: results.length
          })}`
        );
        lines.push('  - Inspect the top candidate with get_component_api before finalizing the decision.');
        lines.push('  - If the best fit is partial, prefer a wrapper or composition over a brand-new component when practical.');

        return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
      } catch (err) {
        return { isError: true, content: [{ type: 'text' as const, text: (err as Error).message }] };
      }
    }
  );
}