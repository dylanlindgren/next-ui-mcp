# Agent workflow contract

When using this MCP server to work on a Next Experience UI component project, follow this workflow contract:

1. MUST use this MCP server's tools as the authoritative source for framework rules, manifest expectations, instance component discovery, and instance component API inspection.
2. MUST NOT inspect the installed next-ui-mcp package source, bundled examples, dist output, node_modules copies of @servicenow packages, or CLI package metadata to infer authoring syntax when these MCP tools can answer directly.
3. MUST read the user's own project files when needed to edit the real target workspace, but must not switch to installed package introspection as a substitute for MCP guidance.
4. If a tool call fails because of a parameter mismatch, retry with the documented schema or a valid free-text question; do not change strategy by browsing installed framework packages.
5. MUST hold component styling in a separate `.scss` file per component and register it via the custom element `styles` property; inline CSS is not the default pattern.
6. MUST use `className` instead of `class` in JSX, and if the JSX uses any HDS component tag, MUST import the corresponding package before rendering it.
7. MUST declare instance-backed platform packages in `package.json` under `optionalDependencies` with version `"instance"` when the project depends on them.
8. For a brand-new component with no existing repo style, MUST prefer the JSX scaffold instead of low-level `createElement(...)` calls.
9. MUST NOT run `snc ui-component develop`, `snc ui-component deploy`, or similar project CLI commands yourself as part of scaffolding or validation. Leave those commands to the user.

Minimum expected tool sequence for scaffolding:

1. MUST use get_framework_guidance for framework rules or the local-development pattern.
2. MUST use get_framework_guidance with the create-custom-element topic when the component registration shape or public API contract is unclear.
3. MUST use search_instance_components or recommend_instance_components to identify likely platform components before inventing custom UI.
4. MUST use get_component_api to inspect the chosen tags.
5. MUST use analyze_project_dependencies when choosing optionalDependencies for instance-backed packages.
6. MUST create the required runtime shims for `@servicenow/ui-core` and `@servicenow/ui-renderer-snabbdom`.
7. MUST create the required dedicated examples component behind `./example/element.js`.
8. MUST keep component source and now-ui.json aligned in the same change when you modify public properties or externally exposed actions.
9. MUST prefer platform components such as `now-card` over custom cards whenever the instance already exposes a suitable primitive.
10. MUST keep component styles in a separate `.scss` file that is imported and assigned through the `styles` property in `createCustomElement(...)`.