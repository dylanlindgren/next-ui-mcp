import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const EXPLANATION = `# now-ui.json in a Now/Next Experience UI Framework component project

now-ui.json is the machine-readable manifest for every custom component in this project.
It sits alongside src/ at the project root and is keyed by component directory name:

  {
    "components": {
      "<component-directory-name>": {
        "properties": [ { "name", "label", "fieldType", "defaultValue", "description", ... } ],
        "actions":    [ { "name", "label", "description", "payload": [...] } ],
        "uiBuilder":  { "label", "icon", "description", "category" }
      }
    }
  }

It is NOT derived automatically from the component's index.js — it is a separate,
hand-maintained (or tool-maintained) declaration that other tooling (UI Builder,
the platform, this MCP server's own checker) reads to know a component's public API,
without executing the component's JavaScript.

## The rule

Every entry passed to \`properties\` in the component's \`createCustomElement(name, { properties: {...} })\`
call must have a matching object (same "name") in that component's "properties" array in now-ui.json.

Every event name passed to \`dispatch(name, payload)\` anywhere in the component must have a
matching object (same "name") in that component's "actions" array in now-ui.json.

## When to act

Whenever you create a new component, or add/remove/rename a property or a dispatched event on an
existing one, update both files in the same change. Then call the "check_manifest_sync" tool on
that component's directory to verify — it does the diff for you and tells you exactly what's
missing or stale, rather than relying on remembering to do it by hand.
`;

export function registerExplainManifest(server: McpServer) {
  server.tool(
    'explain_now_ui_manifest',
    'Explains what now-ui.json is for in a ServiceNow Now/Next Experience UI Framework ' +
      'component project, and the rule that every property and dispatched event in a ' +
      "component's source must have a matching declaration in now-ui.json. Read this before " +
      'creating or editing a component if you are unsure whether the manifest needs updating too.',
    {},
    async () => ({ content: [{ type: 'text' as const, text: EXPLANATION }] })
  );
}
