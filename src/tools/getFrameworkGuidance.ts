import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readGuidanceFile } from '../lib/readGuidanceFile.js';
import { renderComponentScaffold } from '../lib/renderComponentScaffold.js';

const GUIDANCE_TOPICS = [
  'create-custom-element',
  'agent-workflow-contract',
  'framework-basics',
  'local-development-entry',
  'sample-project-structure',
  'now-ui-manifest',
  'instance-backed-dependencies',
  'platform-component-selection'
] as const;

type GuidanceTopic = (typeof GUIDANCE_TOPICS)[number];

const GUIDANCE: Record<Exclude<GuidanceTopic, 'sample-project-structure'>, string> = {
  'create-custom-element': readGuidanceFile('create-custom-element'),
  'agent-workflow-contract': readGuidanceFile('agent-workflow-contract'),
  'framework-basics': readGuidanceFile('framework-basics'),
  'local-development-entry': readGuidanceFile('local-development-entry'),
  'now-ui-manifest': readGuidanceFile('now-ui-manifest'),
  'instance-backed-dependencies': readGuidanceFile('instance-backed-dependencies'),
  'platform-component-selection': readGuidanceFile('platform-component-selection')
};

function isGuidanceTopic(topic: string): topic is GuidanceTopic {
  return GUIDANCE_TOPICS.includes(topic as GuidanceTopic);
}

function availableTopicsText(): string {
  return GUIDANCE_TOPICS.map((topic) => `  - ${topic}`).join('\n');
}

function resolveTopic(topic?: string, question?: string): GuidanceTopic {
  if (topic && topic in GUIDANCE) {
    return topic as GuidanceTopic;
  }

  if (!topic && !question) {
    return 'create-custom-element';
  }

  const query = `${topic ?? ''} ${question ?? ''}`.toLowerCase();
  if (
    query.includes('createcustomelement') ||
    query.includes('create custom element') ||
    query.includes('component registration') ||
    query.includes('state.properties') ||
    query.includes('renderer') ||
    query.includes('view function')
  ) {
    return 'create-custom-element';
  }
  if (query.includes('workflow contract') || query.includes('which mcp tools') || query.includes('used and why') || query.includes('tool usage')) {
    return 'agent-workflow-contract';
  }
  if (query.includes('element.js') || query.includes('example/') || query.includes('innerhtml') || query.includes('local development')) {
    return 'local-development-entry';
  }
  if (
    query.includes('sample project') ||
    query.includes('project structure') ||
    query.includes('scaffold') ||
    query.includes('folder structure') ||
    query.includes('starter structure')
  ) {
    return 'sample-project-structure';
  }
  if (query.includes('manifest') || query.includes('now-ui')) return 'now-ui-manifest';
  if (query.includes('optionaldepend') || query.includes('instance') || query.includes('--fa')) {
    return 'instance-backed-dependencies';
  }
  if (query.includes('recommend') || query.includes('discover') || query.includes('platform')) {
    return 'platform-component-selection';
  }
  return 'framework-basics';
}

export function registerGetFrameworkGuidance(server: McpServer) {
  server.tool(
    'get_framework_guidance',
    'MANDATORY workflow guidance for ServiceNow Now/Next Experience UI Framework projects. For new components with no existing local style, MUST prefer the JSX scaffold returned by get_component_scaffold and MUST NOT hand-write low-level createElement trees unless the repo already uses that pattern. MUST prefer platform components such as now-card, now-button, and similar instance-backed HDS components before creating custom equivalents. MUST import the corresponding package for any HDS component used in JSX or markup, for example import "@servicenow/now-card" or import "@servicenow/now-button". MUST declare instance-backed platform packages in package.json under optionalDependencies with version "instance" rather than leaving them implicit. MUST also use the local runtime shims at src/runtime/ui-core.js and src/runtime/snabbdom.js for createCustomElement and the renderer. Runtime shims MUST import servicenowUiCore and servicenowUiRendererSnabbdom from @servicenow/ui-mega. Neither component source nor runtime shim files may import or re-export from @servicenow/ui-core or @servicenow/ui-renderer-snabbdom; wrapping those original packages in local files does not satisfy this requirement. JSX must use className instead of class, and styles must live in a separate .scss file per component, imported and declared on the component definition via the styles property. This tool includes the createCustomElement stub pattern, the agent workflow contract, the sample project structure, local development entry patterns, manifest rules, instance-backed dependency patterns, and the platform-component-first decision flow. When called without arguments, it defaults to create-custom-element guidance.',
    {
      topic: z.string().optional().describe('Optional guidance topic to retrieve directly.'),
      question: z.string().optional().describe('Optional free-text question used to choose the closest bundled guidance topic.')
    },
    async ({ topic, question }) => {
      if (topic && !isGuidanceTopic(topic)) {
        const suggestedTopic = resolveTopic(undefined, topic);
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text:
                `Unknown guidance topic "${topic}". Available topics are:\n${availableTopicsText()}\n\n` +
                `Closest bundled topic for that request: ${suggestedTopic}\n` +
                'If you want the minimal stub files directly, call get_component_scaffold instead.'
            }
          ]
        };
      }

      const resolvedTopic = resolveTopic(topic, question);
      const text =
        resolvedTopic === 'sample-project-structure'
          ? renderComponentScaffold({ componentName: 'my-component', elementPrefix: 'my-scope' })
          : GUIDANCE[resolvedTopic];

      return { content: [{ type: 'text' as const, text }] };
    }
  );
}