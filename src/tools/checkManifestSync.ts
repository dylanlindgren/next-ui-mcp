import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { diffApis } from '../lib/diff.js';
import { componentNameFromDir, findManifestPath } from '../lib/findManifest.js';
import { parseManifestComponent } from '../lib/parseManifest.js';
import { parseComponentSource } from '../lib/parseComponentSource.js';

export function registerCheckManifestSync(server: McpServer) {
  server.tool(
    'check_manifest_sync',
    "Checks whether a ServiceNow Now/Next Experience UI Framework component's properties " +
      "and dispatched events are correctly declared in the project's now-ui.json manifest. " +
      'Call this immediately after creating or editing any component under src/<component-name>/index.js ' +
      '— it reports exactly what is missing or stale so it can be fixed in the same turn.',
    {
      componentDir: z
        .string()
        .describe('Path (absolute, or relative to the current working directory) to the component directory, e.g. "src/select-number".')
    },
    async ({ componentDir }: { componentDir: string }) => {
      const absDir = resolve(componentDir);
      const componentName = componentNameFromDir(absDir);

      let source: string;
      try {
        source = await readFile(join(absDir, 'index.js'), 'utf8');
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Could not read ${join(absDir, 'index.js')}: ${(err as Error).message}` }]
        };
      }

      const manifestPath = await findManifestPath(absDir);
      if (!manifestPath) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `No now-ui.json found above ${absDir}. Is this a Now/Next Experience UI Framework component project?`
            }
          ]
        };
      }

      const manifestApi = await parseManifestComponent(manifestPath, componentName);
      if (!manifestApi) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text:
                `Component "${componentName}" has no entry in ${manifestPath}. ` +
                `Add one under components["${componentName}"] with a "properties" array and, ` +
                `if it dispatches events, an "actions" array.`
            }
          ]
        };
      }

      const codeApi = parseComponentSource(source);
      const report = diffApis(componentName, manifestPath, codeApi, manifestApi);

      const lines: string[] = [];
      if (report.ok) {
        lines.push(`now-ui.json is in sync with index.js for "${componentName}".`);
      } else {
        lines.push(`now-ui.json is OUT OF SYNC with index.js for "${componentName}".`);
        if (report.missingFromManifest.properties.length) {
          lines.push(`- Properties used in code but MISSING from manifest: ${report.missingFromManifest.properties.join(', ')}`);
        }
        if (report.missingFromManifest.actions.length) {
          lines.push(`- Events dispatched in code but MISSING from manifest "actions": ${report.missingFromManifest.actions.join(', ')}`);
        }
        if (report.staleInManifest.properties.length) {
          lines.push(`- Properties declared in manifest but not found in code (possibly stale): ${report.staleInManifest.properties.join(', ')}`);
        }
        if (report.staleInManifest.actions.length) {
          lines.push(`- Actions declared in manifest but never dispatched in code (possibly stale): ${report.staleInManifest.actions.join(', ')}`);
        }
        lines.push(`Manifest file: ${manifestPath}`);
      }

      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    }
  );
}
