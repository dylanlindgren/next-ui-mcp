# createCustomElement guidance

createCustomElement(tagName, definition) is the authoritative place where a custom Now/Next Experience UI Framework component declares its runtime identity and public API.

Agents should treat the main parts of the definition object this way:

- tagName: the browser custom-element tag that gets registered at runtime.
- renderer: the rendering engine configuration, commonly the snabbdom renderer in these projects.
- view: the render function that reads state and returns the component's UI tree.
- properties: the public inputs the component accepts from consumers.
- actionHandlers: optional inbound actions the component responds to.

Practical rules:

1. The properties object is the source of truth for public inputs in code. Properties that are part of the public contract should also appear in now-ui.json.
2. The view function should read component inputs from state.properties rather than inventing a separate public API surface.
3. Dispatch(name, payload) calls only need matching now-ui.json action entries when ServiceNow tooling or external consumers are expected to listen to them as part of the component's public contract.
4. The createCustomElement call defines runtime behavior; now-ui.json defines the machine-readable manifest for tooling such as UI Builder. They must stay aligned.
5. MUST import createCustomElement, createElement, and the snabbdom renderer through the local runtime shims rather than directly from @servicenow/ui-core or @servicenow/ui-renderer-snabbdom.
6. Treat those runtime shim files as required scaffolding for every component project, not as an optional cleanup step.
7. MUST prefer a platform component such as now-card before creating a custom card or custom primitive when the platform already exposes a matching element.
8. MUST keep component styles in a separate `.scss` file for each component, import that stylesheet, and declare it in the `createCustomElement(...)` definition via the `styles` property. Do not inline CSS in the view or attach ad hoc style blocks.

JSX and transpilation:

- The examples in this guidance use JSX because standard ServiceNow component projects typically transpile it as part of the normal build pipeline.
- For new components with no existing local style, prefer the JSX scaffold and do not hand-write low-level `createElement(...)` trees unless the repo already uses that pattern.
- JSX must use `className`, not `class`, when setting CSS classes on elements.
- If the target repo already uses `createElement(...)` calls instead of JSX, keep the existing style.
- If the repo has no prior component code, prefer the scaffold returned by `get_component_scaffold` rather than inventing a lower-level render style.
- Whenever JSX renders an HDS component, import its corresponding package explicitly before using it, e.g. `import '@servicenow/now-card';`, `import '@servicenow/now-button';`, or the matching package for the chosen tag. Do not assume the tag is globally registered without the import.
- When an HDS component is instance-backed, declare its package in `package.json` under `optionalDependencies` with version `"instance"`.

Minimal shape:

```js
import {createCustomElement} from '../runtime/ui-core';
import {createElement} from '../runtime/snabbdom';
import snabbdom from '../runtime/snabbdom';

const view = (state, {dispatch}) => {
  const {label = 'Status'} = state.properties;
  return (
    <now-card className="status-card">
      <div className="status-card__content">{label}</div>
    </now-card>
  );
};

import '@servicenow/now-card';

createCustomElement('x-scope-status-card', {
  renderer: {type: snabbdom},
  view,
  properties: {
    label: {default: 'Status'}
  }
});

// src/runtime/ui-core.js
import {servicenowUiCore} from '@servicenow/ui-mega';
export const {createCustomElement} = servicenowUiCore;

// src/runtime/snabbdom.js
import {servicenowUiRendererSnabbdom} from '@servicenow/ui-mega';
export const {createElement} = servicenowUiRendererSnabbdom;
export default servicenowUiRendererSnabbdom.default || servicenowUiRendererSnabbdom;
```

Interpretation:

- Consumers set public inputs through the declared properties.
- The view reads those inputs from state.properties.
- If the component dispatches events that ServiceNow or other external consumers need to listen to, those event names become part of the public contract and belong in now-ui.json.
- The root src/index.js usually imports the component module so registration happens when the bundle loads.