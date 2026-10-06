import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readGuidanceFile } from '../lib/readGuidanceFile.js';

const EXPLANATION = readGuidanceFile('explain-now-ui-manifest');

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
