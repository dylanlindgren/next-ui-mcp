import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { validateNowUiJson } from '../lib/validateNowUiJson.js';

function parseManifestInput(input: unknown): Record<string, unknown> {
  if (typeof input === 'string') {
    return JSON.parse(input) as Record<string, unknown>;
  }

  if (input && typeof input === 'object') {
    return input as Record<string, unknown>;
  }

  throw new Error('Expected a now-ui.json object or a raw JSON string.');
}

export function registerValidateNowUiManifest(server: McpServer) {
  server.tool(
    'validate_now_ui_manifest',
    'Validates a now-ui.json manifest using the ServiceNow component-schema-validation package. Accepts either the raw manifest object or a JSON string. Returns whether the manifest is valid and any AJV/custom schema issues found.',
    {
      manifest: z.union([z.record(z.any()), z.string()]).describe('The now-ui.json object or its raw JSON string to validate.')
    },
    async ({ manifest }) => {
      try {
        const parsed = parseManifestInput(manifest);
        const result = validateNowUiJson(parsed);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  valid: result.valid,
                  errors: result.errors,
                  warnings: result.warnings
                },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to validate now-ui.json.';
        return {
          isError: true,
          content: [{ type: 'text' as const, text: message }]
        };
      }
    }
  );
}
