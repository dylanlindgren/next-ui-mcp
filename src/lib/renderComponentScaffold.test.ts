import test from 'node:test';
import assert from 'node:assert/strict';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { renderComponentScaffold } from './renderComponentScaffold.js';
import { registerGetComponentScaffold } from '../tools/getComponentScaffold.js';
import { registerGetFrameworkGuidance } from '../tools/getFrameworkGuidance.js';

test('component scaffold backs both runtime shims with ui-mega', () => {
  const scaffold = renderComponentScaffold({ componentName: 'status-card', elementPrefix: 'x-test' });

  assert.ok(scaffold.includes("import {servicenowUiCore} from '@servicenow/ui-mega';"));
  assert.ok(scaffold.includes('export const {createCustomElement} = servicenowUiCore;'));
  assert.ok(scaffold.includes("import {servicenowUiRendererSnabbdom} from '@servicenow/ui-mega';"));
  assert.ok(scaffold.includes('export const {createElement} = servicenowUiRendererSnabbdom;'));
  assert.ok(scaffold.includes('export default servicenowUiRendererSnabbdom.default || servicenowUiRendererSnabbdom;'));
  assert.doesNotMatch(scaffold, /\bfrom\s+['"]@servicenow\/(?:ui-core|ui-renderer-snabbdom)['"]/);
});

test('component scaffold uses next-ui-storybook for local preview', () => {
  const scaffold = renderComponentScaffold({ componentName: 'status-card', elementPrefix: 'x-test' });

  assert.ok(scaffold.includes('.storybook/main.mjs'));
  assert.ok(scaffold.includes('@dylanlindgren/next-ui-storybook-addon'));
  assert.ok(scaffold.includes("stories: ['../stories/**/*.stories.@(js|jsx|mjs)']"));
  assert.ok(scaffold.includes('stories/status-card.stories.js'));
  assert.ok(scaffold.includes("const TAG = 'x-test-status-card';"));
  assert.ok(scaffold.includes('"storybook": "storybook dev -p 6006"'));
  assert.ok(scaffold.includes('"@servicenow/ui-mega": "instance"'));
  assert.doesNotMatch(scaffold, /example\/element\.js|src\/examples\/index\.js/);
});

test('component tags default to the kebab-case scope while preserving the manifest scope', () => {
  const scaffold = renderComponentScaffold({ componentName: 'my-component', scopeName: 'x_snc_abc123' });

  assert.ok(scaffold.includes("createCustomElement('x-snc-abc123-my-component',"));
  assert.ok(scaffold.includes("const TAG = 'x-snc-abc123-my-component';"));
  assert.ok(scaffold.includes('"x-snc-abc123-my-component": {'));
  assert.ok(scaffold.includes('"scopeName": "x_snc_abc123"'));
  assert.ok(scaffold.includes('"tileIcon": "./tile-icon/generic-tile-icon.svg"'));
});

test('component tags do not duplicate an existing scope prefix', () => {
  const scaffold = renderComponentScaffold({
    componentName: 'x-snc-abc123-my-component',
    scopeName: 'x_snc_abc123'
  });

  assert.ok(scaffold.includes("createCustomElement('x-snc-abc123-my-component',"));
  assert.doesNotMatch(scaffold, /x-snc-abc123-x-snc-abc123/);
});

test('explicit element prefixes override the tag prefix without changing the manifest scope', () => {
  const scaffold = renderComponentScaffold({
    componentName: 'my-component',
    scopeName: 'x_snc_abc123',
    elementPrefix: 'x-custom'
  });

  assert.ok(scaffold.includes("createCustomElement('x-custom-my-component',"));
  assert.ok(scaffold.includes('"scopeName": "x_snc_abc123"'));
});

test('scaffold and framework tool descriptions prohibit original packages inside runtime shims', () => {
  const descriptions = new Map<string, string>();
  const server = {
    tool(name: string, description: string) {
      descriptions.set(name, description);
    }
  } as unknown as McpServer;

  registerGetComponentScaffold(server);
  registerGetFrameworkGuidance(server);

  for (const name of ['get_component_scaffold', 'get_framework_guidance']) {
    const description = descriptions.get(name);
    assert.ok(description, `Missing description for ${name}`);
    assert.ok(description.includes('Runtime shims MUST import servicenowUiCore and servicenowUiRendererSnabbdom from @servicenow/ui-mega'));
    assert.ok(description.includes('Neither component source nor runtime shim files may import or re-export from @servicenow/ui-core or @servicenow/ui-renderer-snabbdom'));
    assert.ok(description.includes('next-ui-storybook'));
  }
});

test('framework guidance routes Storybook setup and adoption questions to migration guidance', async () => {
  let guidanceHandler: ((args: { question?: string; topic?: string }) => Promise<unknown>) | undefined;
  const server = {
    tool(_name: string, _description: string, ...args: unknown[]) {
      const handler = args.at(-1);
      if (typeof handler === 'function') {
        guidanceHandler = handler as (args: { question?: string; topic?: string }) => Promise<unknown>;
      }
    }
  } as unknown as McpServer;

  registerGetFrameworkGuidance(server);

  assert.ok(guidanceHandler);
  const byTopic = await guidanceHandler({ topic: 'storybook-local-development' });
  const byQuestion = await guidanceHandler({ question: 'How do I migrate this project to Storybook?' });

  for (const response of [byTopic, byQuestion]) {
    const text = JSON.stringify(response);
    assert.ok(text.includes('@dylanlindgren/next-ui-storybook-addon'));
    assert.ok(text.includes('Do not overwrite custom Storybook configuration'));
    assert.ok(text.includes('Batch public'));
    assert.ok(text.includes('not a public npm version'));
    assert.ok(text.includes('A static Storybook build is not mandatory'));
    assert.ok(text.includes('unrelated baseline failures'));
    assert.ok(text.includes('remains unverified'));
  }
});