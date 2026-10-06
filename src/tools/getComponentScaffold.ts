import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { renderComponentScaffold } from '../lib/renderComponentScaffold.js';

export function registerGetComponentScaffold(server: McpServer) {
  server.tool(
    'get_component_scaffold',
    'Returns a minimal Now/Next Experience UI Framework component scaffold. This MUST include the required local runtime shims for createCustomElement and the renderer, a matching now-ui.json stub, the example/element.js wiring pattern, and a separate component stylesheet in .scss that is imported and assigned via the createCustomElement styles property. For new components without an existing repo style, MUST prefer the JSX scaffold and MUST NOT hand-write low-level createElement trees. Agents MUST NOT import @servicenow/ui-core or @servicenow/ui-renderer-snabbdom directly from component source; they must prefer existing platform components such as now-card before inventing a custom card or primitive when a suitable HDS component already exists. Any HDS component used in JSX must also include the matching package import (for example import "@servicenow/now-card"), and all JSX class names must use className instead of class. If the component is instance-backed, the generated package.json should declare the platform package in optionalDependencies with version "instance".',
    {
      componentName: z
        .string()
        .optional()
        .describe('Optional kebab-case component folder name, such as my-component. Defaults to my-component.'),
      elementPrefix: z
        .string()
        .optional()
        .describe('Optional custom element prefix, such as my-scope. Defaults to my-scope.')
    },
    async ({ componentName, elementPrefix }) => ({
      content: [
        {
          type: 'text' as const,
          text: renderComponentScaffold({ componentName, elementPrefix })
        }
      ]
    })
  );
}