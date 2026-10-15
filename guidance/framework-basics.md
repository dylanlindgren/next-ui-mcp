# Next Experience UI Framework basics

ServiceNow Now/Next Experience UI Framework components are not standard web components authored in a generic ecosystem. Agents should assume these projects revolve around createCustomElement(...), a now-ui.json manifest, action dispatch patterns, and UI Builder metadata.

Key rules:

- Treat this MCP server's tool responses as the authoritative workflow surface for framework guidance and instance component APIs.
- Do not inspect the installed next-ui-mcp package source, dist output, bundled examples, node_modules copies of @servicenow packages, or CLI package metadata as a substitute for using these MCP tools.
- If the component registration shape is unclear, query the create-custom-element guidance instead of inferring syntax from installed packages.
- Public component inputs live in the properties object passed to createCustomElement(...).
- Public component outputs are the event names passed to dispatch(name, payload) when those events are meant for ServiceNow tooling or other external consumers.
- now-ui.json is a separate manifest that should declare those publicly exposed properties and dispatched events for tooling such as UI Builder.
- `next-ui-storybook` with `@dylanlindgren/next-ui-storybook-addon` is the default local development and preview workflow.
- Each new component should have a Storybook story that imports the component source and renders its custom-element tag with representative property args.
- For an existing project, inspect its package manifest, scripts, Storybook config, stories, and instructions before migration. Preserve compatible setup and make targeted changes; do not replace user configuration wholesale.
- Before hand-rolling new UI, inspect available platform components on the configured instance.
- Treat the scaffold as incomplete until local runtime shims exist for @servicenow/ui-core and @servicenow/ui-renderer-snabbdom.

Decision tree:

1. If you are starting a new component, call `get_component_scaffold` first.
2. If the UI might already exist as HDS, call `evaluate_platform_component_fit` before writing custom code.
3. If the best HDS match is close but not exact, prefer composition or a thin wrapper.
4. Build from scratch only when the HDS candidates do not fit the required API or behavior.

JSX note:

- Standard ServiceNow component projects typically transpile JSX as part of the normal build pipeline.
- Follow the existing project style when a repo already uses `createElement(...)` instead of JSX.
- For the detailed JSX/transpilation rules and the minimal registration shape, use the `create-custom-element` guidance topic.

Stub entry points:

- Call `get_component_scaffold` for the full folder structure, runtime shims, Storybook config and story, and `now-ui.json` stub.
- Use the `sample-project-structure` guidance topic when the agent needs the scaffold, or `storybook-local-development` for setup and migration guidance.
- Use the `create-custom-element` guidance topic when the agent only needs the registration shape and runtime semantics.