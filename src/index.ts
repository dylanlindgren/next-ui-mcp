#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCheckManifestSync } from './tools/checkManifestSync.js';
import { registerExplainManifest } from './tools/explainManifest.js';
import { registerGetComponentApi } from './tools/getComponentApi.js';

const server = new McpServer({
  name: 'next-ui-mcp',
  version: '0.1.0'
});

registerExplainManifest(server);
registerCheckManifestSync(server);
registerGetComponentApi(server);

const transport = new StdioServerTransport();
await server.connect(transport);
