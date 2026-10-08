import test from 'node:test';
import assert from 'node:assert/strict';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { fetchInstanceComponentCatalog } from './instanceCatalog.js';
import { registerGetComponentApi } from '../tools/getComponentApi.js';

test('discovers macroponent slots and exposes them through get_component_api', async (context) => {
  const originalUrl = process.env.NEXT_UI_INSTANCE_URL;
  const originalToken = process.env.NEXT_UI_INSTANCE_TOKEN;
  process.env.NEXT_UI_INSTANCE_URL = 'https://slots-test.service-now.com';
  process.env.NEXT_UI_INSTANCE_TOKEN = 'test-token';
  context.after(() => {
    if (originalUrl === undefined) delete process.env.NEXT_UI_INSTANCE_URL;
    else process.env.NEXT_UI_INSTANCE_URL = originalUrl;
    if (originalToken === undefined) delete process.env.NEXT_UI_INSTANCE_TOKEN;
    else process.env.NEXT_UI_INSTANCE_TOKEN = originalToken;
  });

  const definitions = [
    { value: '{"availableSlots":["identifier","metadata","content"]}', display_value: 'Ignored' },
    undefined,
    '',
    '{invalid json',
    'null',
    '{}',
    '{"availableSlots":"content"}',
    '{"availableSlots":["content",null,42,"",{},"content"]}',
    '{"availableSlots":[]}',
    '{"availableSlots":["@default"]}',
    '{"availableSlots":["@default","content","@default"]}'
  ];
  const requests: URL[] = [];
  context.mock.method(globalThis, 'fetch', async (input: URL) => {
    const url = new URL(input);
    requests.push(url);
    const table = url.pathname.split('/').at(-1);
    let result: unknown[];
    if (table === 'sys_ux_lib_component') {
      result = definitions.map((_, index) => ({
        sys_id: { value: `component-${index}`, display_value: `component-${index}` },
        tag: {
          value: index === 0 ? 'now-accordion-item' : `now-test-${index}`,
          display_value: index === 0 ? 'now-accordion-item' : `now-test-${index}`
        }
      }));
    } else if (table === 'sys_ux_macroponent') {
      result = definitions.map((definition, index) => ({
        root_component: { value: `component-${index}`, display_value: 'Component' },
        props: '[{"name":"expanded","fieldType":"boolean"}]',
        dispatched_events: index === 0 ? 'event-1' : '',
        root_component_definition: definition
      }));
      result.push({ root_component: 'component-0', root_component_definition: '{"availableSlots":["content"]}' });
    } else {
      assert.equal(table, 'sys_ux_event');
      result = [{ sys_id: 'event-1', event_name: 'ACCORDION_ITEM#TOGGLED' }];
    }
    return new Response(JSON.stringify({ result }), { status: 200 });
  });

  const catalog = await fetchInstanceComponentCatalog(true);
  const accordion = catalog.find((component) => component.tag === 'now-accordion-item');
  assert.ok(accordion);
  assert.deepEqual(accordion.slots, ['identifier', 'metadata', 'content']);
  assert.equal(accordion.properties[0].name, 'expanded');
  assert.equal(accordion.actions[0].name, 'ACCORDION_ITEM#TOGGLED');
  assert.equal(accordion.hasDefaultSlot, false);
  for (let index = 1; index < definitions.length; index += 1) {
    assert.deepEqual(catalog.find((component) => component.tag === `now-test-${index}`)?.slots,
      index === 7 || index === 10 ? ['content'] : []);
    assert.equal(catalog.find((component) => component.tag === `now-test-${index}`)?.hasDefaultSlot,
      index === 9 || index === 10);
  }
  const macroponentRequest = requests.find((url) => url.pathname.endsWith('/sys_ux_macroponent'));
  assert.ok(macroponentRequest?.searchParams.get('sysparm_fields')?.split(',').includes('root_component_definition'));

  let handler: ((input: { componentTag: string }) => Promise<CallToolResult>) | undefined;
  const server = {
    tool: (...args: unknown[]) => {
      handler = args.at(-1) as typeof handler;
    }
  } as unknown as McpServer;
  registerGetComponentApi(server);
  assert.ok(handler);
  const response = await handler({ componentTag: 'now-accordion-item' });
  const text = response.content[0];
  assert.equal(text.type, 'text');
  if (text.type !== 'text') assert.fail('Expected text output');
  assert.match(text.text, /Slots:\n  - identifier\n  - metadata\n  - content/);
  assert.match(text.text, /<now-accordion-item>\n  <div slot="identifier">/);
  assert.match(text.text, /<div slot="content">\.\.\.<\/div>/);
  assert.match(text.text, /expanded: boolean/);
  assert.match(text.text, /ACCORDION_ITEM#TOGGLED/);

  const noSlots = await handler({ componentTag: 'now-test-1' });
  assert.equal(noSlots.content[0].type, 'text');
  if (noSlots.content[0].type !== 'text') assert.fail('Expected text output');
  assert.match(noSlots.content[0].text, /Slots:\n  \(none registered\)/);
  assert.doesNotMatch(noSlots.content[0].text, /slot="/);

  for (const componentTag of ['now-test-9', 'now-test-10']) {
    const defaultSlot = await handler({ componentTag });
    const defaultText = defaultSlot.content[0];
    if (defaultText.type !== 'text') assert.fail('Expected text output');
    assert.match(defaultText.text, /Accepts ordinary child content without a slot attribute/);
    assert.match(defaultText.text, /<div>\.\.\.<\/div>/);
    assert.doesNotMatch(defaultText.text, /@default/);
    if (componentTag === 'now-test-9') {
      assert.match(defaultText.text, /Slots:\n  \(none registered\)/);
      assert.doesNotMatch(defaultText.text, /slot="/);
    } else {
      assert.match(defaultText.text, /<div slot="content">/);
    }
  }
});