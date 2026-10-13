import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchInstanceIcons } from '../lib/instanceIcons.js';

export function registerSearchInstanceIcons(server: McpServer) {
  server.tool(
    'search_instance_icons',
    'Searches the icon library (the `icon` property of now-icon, now-button, now-alert, now-pill and other HDS ' +
      "components) on the user's configured ServiceNow instance. Icon names are read from the instance's " +
      'now-icon package, so results are the real icons available there. Use this BEFORE picking an icon name ' +
      'instead of guessing. Results are base names in dash-case (e.g. "star", "address-book"); append "-outline" or ' +
      '"-fill" to get the value for an `icon` property (e.g. "star-outline"). Passing a full name such as ' +
      '"star-outline" also validates that the base icon exists. Requires NEXT_UI_INSTANCE_URL and credentials.',
    {
      query: z
        .string()
        .optional()
        .describe('Free-text search, e.g. "user", "arrow right", or "star-outline". Omit to list icons alphabetically.'),
      limit: z.number().int().min(1).max(500).optional().describe('Maximum number of icons to return. Defaults to 50.')
    },
    async ({ query, limit }) => {
      try {
        const result = await searchInstanceIcons({ query, limit });

        if (result.names.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `No icons matched "${query}" among ${result.totalIcons} icons on the configured instance. Try a shorter or more generic term.`
              }
            ]
          };
        }

        const lines: string[] = [
          `Showing ${result.names.length} of ${result.totalMatches} matching icons (${result.totalIcons} on the instance).`
        ];
        if (query?.trim()) {
          lines.push(
            result.exactMatch
              ? `"${query.trim()}" resolves to an existing icon.`
              : `"${query.trim()}" is not an exact icon name; closest matches are listed first.`
          );
        }
        lines.push('', ...result.names.map(name => `- ${name}`));
        lines.push(
          '',
          'Use as icon="<name>-outline" or icon="<name>-fill". A base icon is not guaranteed to have both variants.'
        );
        if (result.totalMatches > result.names.length) {
          lines.push('Raise `limit` or narrow `query` to see more.');
        }

        return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
      } catch (err) {
        return { isError: true, content: [{ type: 'text' as const, text: (err as Error).message }] };
      }
    }
  );
}
