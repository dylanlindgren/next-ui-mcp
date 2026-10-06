# Choosing platform components first

Before creating custom UI primitives, search the configured instance for platform components and inspect their properties and events.

Recommended flow:

1. MUST use search_instance_components to discover candidates.
2. MUST use recommend_instance_components if you only know the use case or desired props/events.
3. MUST use get_component_api to inspect the exact API for the chosen tag.
4. MUST add the package as an optionalDependency with version "instance" when appropriate.

MUST prefer existing UI framework components over custom cards, panels, buttons, inputs, and similar primitives whenever the platform already exposes a matching element such as `now-card`. Do not hand-roll a custom card if `now-card` or a closely related instance-backed component is available. When using `now-card`, also add the package import: `import '@servicenow/now-card';` before the JSX element is rendered.

Do not browse this package's own source tree, bundled examples, installed @servicenow modules, or CLI package metadata to infer component APIs or authoring patterns when these tools can answer directly.

This avoids duplicating built-in platform capabilities and keeps local projects aligned with what UI Builder and the target instance already support.