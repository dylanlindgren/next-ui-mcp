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

- **`get_component_api`** — reads the real API of a platform component from the user's own ServiceNow instance, so an agent works from actual props and events rather than stale or incomplete public package metadata.
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