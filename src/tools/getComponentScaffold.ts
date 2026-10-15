import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { renderComponentScaffold } from '../lib/renderComponentScaffold.js';

export function registerGetComponentScaffold(server: McpServer) {
  server.tool(
    'get_component_scaffold',
    'Returns a minimal Now/Next Experience UI Framework component scaffold that uses Storybook with @dylanlindgren/next-ui-storybook-addon as its default local preview workflow. Include a matching now-ui.json stub, .storybook/main.mjs, a component story, and a separate component stylesheet in .scss imported and assigned via the createCustomElement styles property. Runtime shims MUST import servicenowUiCore and servicenowUiRendererSnabbdom from @servicenow/ui-mega, exactly as shown in the returned scaffold. Neither component source nor runtime shim files may import or re-export from @servicenow/ui-core or @servicenow/ui-renderer-snabbdom; wrapping those original packages in local files does not satisfy this requirement. For new components without an existing repo style, MUST prefer the JSX scaffold and MUST NOT hand-write low-level createElement trees. Agents must assess existing project configuration and preserve compatible Storybook setup, scripts, stories, examples, lockfiles, and custom instructions rather than replacing them wholesale. Agents must prefer existing platform components such as now-card before inventing a custom card or primitive when a suitable HDS component already exists. Any HDS component used in JSX must also include the matching package import (for example import "@servicenow/now-card"), and all JSX class names must use className instead of class. If the component is instance-backed, the generated package.json should declare the platform package in optionalDependencies with version "instance".',
    {
      componentName: z
        .string()
        .optional()
        .describe('Optional kebab-case component folder name, such as my-component. Defaults to my-component.'),
      scopeName: z
        .string()
        .optional()
        .describe('Scope name from the project now-ui.json, such as x_snc_abc123. Read the existing manifest and pass its scopeName when available. Preserved in the manifest and converted to kebab-case for the default component tag prefix, e.g. x-snc-abc123-my-component.'),
      elementPrefix: z
        .string()
        .optional()
        .describe('Optional explicit custom element prefix override. Defaults to the kebab-case scopeName, or my-scope when no scope is supplied.')
    },
    async ({ componentName, scopeName, elementPrefix }) => ({
      content: [
        {
          type: 'text' as const,
          text: renderComponentScaffold({ componentName, scopeName, elementPrefix })
        }
      ]
    })
  );
}