#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAnalyzeProjectDependencies } from './tools/analyzeProjectDependencies.js';
import { registerEvaluatePlatformComponentFit } from './tools/evaluatePlatformComponentFit.js';
import { registerExplainManifest } from './tools/explainManifest.js';
import { registerGetComponentScaffold } from './tools/getComponentScaffold.js';
import { registerGetFrameworkGuidance } from './tools/getFrameworkGuidance.js';
import { registerGetComponentApi } from './tools/getComponentApi.js';
import { registerRecommendInstanceComponents } from './tools/recommendInstanceComponents.js';
import { registerSearchInstanceComponents } from './tools/searchInstanceComponents.js';
import { registerResolveComponentPackage } from './tools/resolveComponentPackage.js';
import { registerValidateNowUiManifest } from './tools/validateNowUiManifest.js';
import pkg from '../package.json' with { type: 'json' }

const server = new McpServer({
  name: pkg.name,
  version: pkg.version
});

registerExplainManifest(server);
registerGetFrameworkGuidance(server);
registerGetComponentScaffold(server);
registerEvaluatePlatformComponentFit(server);
registerAnalyzeProjectDependencies(server);
registerSearchInstanceComponents(server);
registerRecommendInstanceComponents(server);
registerResolveComponentPackage(server);
registerValidateNowUiManifest(server);
registerGetComponentApi(server);

const transport = new StdioServerTransport();
await server.connect(transport);
