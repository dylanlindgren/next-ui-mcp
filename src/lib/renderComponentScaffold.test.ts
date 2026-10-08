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
  }
});