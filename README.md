# next-ui-mcp

An MCP server for helping AI coding agents build, evaluate, and validate ServiceNow **Next Experience UI Framework** components and projects more effectively.

> Unofficial, community-maintained project. Not affiliated with, endorsed by, or supported by ServiceNow.

## Why

Next Experience UI Framework components have two parts that must stay in sync: the component source (`src/<name>/index.js`) and the separate manifest (`now-ui.json`) that declares the component's public properties and dispatched events. AI agents (and humans) routinely edit one without updating the other. That is one important problem this server solves.

But the broader goal is to make AI-assisted development in this framework safer and more reliable across the full workflow:

- understand the framework contract and `now-ui.json` rules
- generate a correct component scaffold from the start
- prefer real platform components before inventing custom UI
- choose between direct use, composition, and custom implementation with evidence
- validate manifests and dependency setup
- inspect live instance API metadata instead of guessing from stale package docs
- follow the correct local project conventions for `example/element.js`, runtime shims, and `optionalDependencies`
- reduce the common failure modes that cause AI-generated Next Experience UI Framework code to be structurally wrong or platform-incompatible

This MCP server is meant to act as a practical operating system for working with Next Experience UI Framework projects in AI-assisted development, with manifest sync as one critical piece of that larger workflow.
## Available MCP tools

### Guidance and scaffolding

- **`explain_now_ui_manifest`** — explains what `now-ui.json` is and how to keep it in sync with the component code.
- **`get_framework_guidance`** — returns bundled guidance for framework patterns, sample project structure, `createCustomElement(...)`, manifest expectations, local development conventions, and instance-backed dependency usage.
- **`get_component_scaffold`** — returns the minimal stub files for a new component, including `createCustomElement(...)`, `example/element.js`, and a matching `now-ui.json` entry.

### Platform component selection

- **`evaluate_platform_component_fit`** — decides whether an instance-backed HDS component should be used directly, wrapped/composed, or replaced with a custom implementation before scaffolding from scratch.
- **`search_instance_components`** — discovers which platform components exist on the configured instance.
- **`recommend_instance_components`** — finds likely platform-component matches from a use case or desired properties/events.
- **`resolve_component_package`** — resolves a platform component tag to the exact npm package it belongs to without guessing.

### Instance API and validation

- **`get_component_api`** — reads the real API of a platform component from the user's own ServiceNow instance, so an agent works from actual props, events, and slots rather than stale or incomplete public package metadata. Slot names come from `sys_ux_macroponent.root_component_definition.availableSlots`, with markup examples showing the `slot` attribute.
- **`analyze_project_dependencies`** — checks whether a project declares platform packages as `optionalDependencies` with version `"instance"` when needed.
- **`validate_now_ui_manifest`** — validates a `now-ui.json` file using the ServiceNow schema validation package and reports schema issues.

## Install

Add to your MCP client config (for example, `.mcp.json` at your project root for Claude Code or `.cursor/mcp.json` for Cursor):

```json
{
  "mcpServers": {
    "next-ui": {
      "command": "npx",
      "args": ["-y", "next-ui-mcp@latest"],
      "env": {
        "NEXT_UI_INSTANCE_URL": "https://your-instance.service-now.com",
        "NEXT_UI_INSTANCE_USER": "your-user",
        "NEXT_UI_INSTANCE_PASSWORD": "your-password"
      }
    }
  }
}
```

Ensure the file is added to your `.gitignore` since it contains credentials.

Instance requests time out after 20 seconds by default. Set `NEXT_UI_INSTANCE_TIMEOUT_MS` in the same `env` block to raise or lower that if your instance is slow or you want to fail faster.

### Configure project instructions

Connecting the server makes its tools available, but project instructions tell the agent when to use them. Add these files to the consuming UI project's root, and commit them so the team shares the same policy.

Keep the shared instructions in `AGENTS.md`:

```markdown
# ServiceNow UI Development

## HDS Policy

Prefer HDS components over custom equivalents.
Prefer composition or thin wrappers when an HDS component is a partial fit.
Custom UI requires a concrete functional or design gap.

## Required Workflow

For new UI and substantial changes to existing UI:
- Before implementation, use next-ui-mcp get_framework_guidance
  with topic "agent-workflow-contract" and follow its guidance.
- Discover HDS candidates using recommend_instance_components
  or search_instance_components.
- Evaluate plausible candidates with evaluate_platform_component_fit.
- Inspect selected components with get_component_api before using them.
- Follow MCP guidance for imports and instance-backed dependencies.
- Briefly explain any decision to create a custom equivalent.
- If MCP tools are unavailable or fail, report the limitation.
  Do not interpret failed discovery as proof that no HDS component exists.
```

Adjust the HDS policy to match the project:

- **Strict:** Use suitable HDS components; custom equivalents require a concrete capability gap.
- **Preferred:** Start with HDS; allow custom UI for documented functional or design requirements. This is the template's default.
- **Selective:** Specify which controls or areas must use HDS and where custom UI is acceptable. Keep that scope consistent with the required workflow.

For **Copilot in VS Code**, enable `chat.useAgentsMdFile` for the Local agent. Start a new chat and confirm `AGENTS.md` is discovered in **Chat: Open Customizations** and included in the response's References or instruction diagnostics. Merge this guidance with any existing project instructions instead of adding conflicting policies.

For **Claude Code**, add a root `CLAUDE.md` containing this import as a plain Markdown line, not inside a code fence:

```markdown
@AGENTS.md
```

Claude Code expands the import automatically, keeping `AGENTS.md` as the single source of shared instructions. Recent versions can also load `AGENTS.md` directly, but the import supports older versions and sessions configured to load only `CLAUDE.md`. If `CLAUDE.md` already exists, add the import and preserve its existing instructions. Start a new session and use `/context` to confirm the project instructions loaded.

Configure and enable the MCP server separately in each client; instruction files do not connect it. Choosing a Claude model inside Copilot still uses Copilot's instruction loading, not Claude Code's.

To check the workflow, ask the agent to add a card containing a button. Verify that it calls component-discovery and API-inspection tools before implementing the UI. Instructions guide behavior but do not guarantee compliance.

## Development

```bash
npm install
npm run build   # compile TypeScript -> dist/
npm run dev     # run directly from src/ via tsx, for local iteration
```

## Contributing

PRs adding improvements to the guidance and instance-backed component discovery flow, are the main way this stays useful and current as the framework evolves. This project is meant to be centrally maintained in one place rather than copied into every project.

## License

MIT