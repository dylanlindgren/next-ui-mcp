# Evaluate platform component fit

Use this tool before writing a custom component when the UI may already exist as a ServiceNow HDS component.

## Purpose

`evaluate_platform_component_fit` answers one question: should the project use an existing platform component directly, wrap it, or build custom UI from scratch?

## Required behavior

1. Start with the user’s use case and desired properties/events.
2. Prefer existing HDS components such as `now-card`, `now-button`, `now-input`, and similar platform elements before inventing a custom equivalent.
3. If the best match is partial, prefer a thin wrapper or composition instead of duplicating the full component in custom code.
4. If the fit is poor, build custom only when the missing behavior cannot be achieved with the platform component.
5. If a custom implementation is still required, keep the view in JSX for new projects, use a dedicated `.scss` file, and declare the styles in the `createCustomElement(...)` definition.

## Typical output expectations

The evaluation should return:

- the best candidate component tag
- how many requested properties/events it covers
- a recommendation to prefer the platform component or a wrapper
- a clear escalation path to custom UI only when necessary

## Relationship to other MCP tools

- `search_instance_components` finds candidates
- `recommend_instance_components` narrows them by intent
- `get_component_api` checks the exact props/events of the chosen one
- `analyze_project_dependencies` confirms the required instance-backed `optionalDependencies` entries

## Rule to enforce

When a card-like or panel-like UI is requested, the default assumption should be to check the platform component library first and prefer `now-card` or similar instance-backed tags before creating a custom card.
