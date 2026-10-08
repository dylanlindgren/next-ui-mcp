# Choosing platform components first

Before creating custom UI primitives, search the configured instance for platform components and inspect their properties, events, and slots.

Recommended flow:

1. MUST use search_instance_components to discover candidates.
2. MUST use recommend_instance_components if you only know the use case or desired props/events.
3. MUST use get_component_api to inspect the exact API for the chosen tag.
4. MUST add the package as an optionalDependency with version "instance" when appropriate.

When `get_component_api` returns named slots, MUST place child content using the corresponding `slot` attribute rather than assuming unslotted children will render. For example, if `now-accordion-item` exposes a `content` slot, use `<now-accordion-item><div slot="content">...</div></now-accordion-item>`. Slot names are discovered from the instance's `sys_ux_macroponent.root_component_definition.availableSlots`; do not guess them.

The `@default` entry means ordinary child content without a `slot` attribute, not a named slot. Never use `slot="@default"`. `get_component_api` reports this as support for ordinary children and shows unslotted markup; a component can also expose named slots alongside ordinary children.

MUST prefer existing UI framework components over custom cards, panels, buttons, inputs, and similar primitives whenever the platform already exposes a matching element such as `now-card`. Do not hand-roll a custom card if `now-card` or a closely related instance-backed component is available. When using `now-card`, also add the package import: `import '@servicenow/now-card';` before the JSX element is rendered.

Do not browse this package's own source tree, bundled examples, installed @servicenow modules, or CLI package metadata to infer component APIs or authoring patterns when these tools can answer directly.

This avoids duplicating built-in platform capabilities and keeps local projects aligned with what UI Builder and the target instance already support.