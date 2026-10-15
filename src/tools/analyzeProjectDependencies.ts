import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { analyzeProjectDependencies } from '../lib/projectPackage.js';

export function registerAnalyzeProjectDependencies(server: McpServer) {
  server.tool(
    'analyze_project_dependencies',
    'Analyzes a Next Experience UI component project package.json for platform components that should be declared as optionalDependencies with the version set to "instance". ' +
      'Use this when adding or changing instance-backed platform dependencies, including preparation for eventual deployment with snc ui-component deploy --fa, regardless of the local preview workflow.',
    {
      packageJsonPath: z
        .string()
        .describe('Path to the target project package.json, absolute or relative to the current working directory.'),
      plannedComponentTags: z
        .array(z.string())
        .optional()
        .describe('Optional list of planned platform component tags, such as now-button or now-modal.')
    },
    async ({ packageJsonPath, plannedComponentTags }) => {
      try {
        const analysis = await analyzeProjectDependencies(packageJsonPath, plannedComponentTags ?? []);
        const lines: string[] = [];

        lines.push(`Package file: ${analysis.packageJsonPath}`, '');

        lines.push('Instance-backed optionalDependencies:');
        if (analysis.instanceOptionalDependencies.length === 0) {
          lines.push('  (none)');
        } else {
          for (const dependency of analysis.instanceOptionalDependencies) {
            lines.push(`  - ${dependency}`);
          }
        }

        lines.push('', 'ServiceNow platform packages not using "instance":');
        if (analysis.regularServiceNowDependencies.length === 0) {
          lines.push('  (none)');
        } else {
          for (const dependency of analysis.regularServiceNowDependencies) {
            lines.push(`  - ${dependency.name}@${dependency.version} in ${dependency.section}`);
          }
        }

        if (analysis.missingInstanceDependencies.length > 0) {
          lines.push('', 'Planned components missing optionalDependencies set to "instance":');
          for (const dependency of analysis.missingInstanceDependencies) {
            lines.push(`  - ${dependency}`);
          }
        }

        if (analysis.shouldMoveToInstanceOptional.length > 0) {
          lines.push('', 'Recommended changes:');
          for (const dependency of analysis.shouldMoveToInstanceOptional) {
            lines.push(`  - Move ${dependency} to optionalDependencies with version "instance"`);
          }
        }

        lines.push(
          '',
          'When you rely on instance-backed platform components, declare their packages in optionalDependencies with version "instance".',
          'For eventual deployment to the instance, the user should run snc ui-component deploy --fa so assets are resolved from the instance. Agents must not execute deployment commands.',
          'If you are still deciding whether to build custom UI or compose an HDS component, run evaluate_platform_component_fit before scaffolding.',
          'Create src/runtime/ui-core.js and src/runtime/snabbdom.js, then import createCustomElement and the snabbdom renderer through those local shims backed by @servicenow/ui-mega so the ui-component plugin does not auto-inject public npm copies of @servicenow/ui-core or @servicenow/ui-renderer-snabbdom during deployment.'
        );

        return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
      } catch (err) {
        return { isError: true, content: [{ type: 'text' as const, text: (err as Error).message }] };
      }
    }
  );
}