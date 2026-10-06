import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { packageNameForTag } from '../lib/projectPackage.js';

export function registerResolveComponentPackage(server: McpServer) {
  server.tool(
    'resolve_component_package',
    'Returns the exact npm package that a ServiceNow HDS component tag belongs to. Examples: now-card -> @servicenow/now-card and now-card-header -> @servicenow/now-card. Never guesses from the tag name; if the tag is not in the curated registry, returns an explicit "unknown" result instead of inventing a package.',
    {
      componentTag: z.string().describe('The component tag to resolve, such as "now-card" or "now-card-header".')
    },
    async ({ componentTag }) => {
      const normalizedTag = componentTag.trim();
      const packageName = packageNameForTag(normalizedTag);

      if (!packageName) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `No package mapping is known for "${normalizedTag}" in the curated HDS registry.`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `Tag: ${normalizedTag}\nPackage: ${packageName}`
          }
        ]
      };
    }
  );
}
