# now-ui.json guidance

now-ui.json is the manifest agents must treat as a first-class artifact, not an afterthought.

What belongs there:

- components[componentName].properties for each externally exposed property from createCustomElement(...)
- components[componentName].actions for each externally exposed event dispatched via dispatch(name, payload)
- components[componentName].uiBuilder metadata so the component is understandable and usable inside UI Builder
- components[componentName].uiBuilder.tileIcon, using `./tile-icon/generic-tile-icon.svg` by default. This SVG already exists in a newly set-up project. A custom icon is fine when needed, but create the SVG under the project root and reference it with a root-relative `.svg` path.

Expected workflow:

1. Edit index.js and now-ui.json in the same change.
2. Treat property and externally exposed action changes as manifest changes too.
3. Fix missing or stale manifest entries before moving on.
4. Keep `uiBuilder.tileIcon` present and non-empty for every component. Prefer the existing generic icon unless there is a reason to create a component-specific SVG.