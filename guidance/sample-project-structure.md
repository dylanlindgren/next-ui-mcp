# Sample project structure

Use this as the baseline scaffold for a local Now/Next Experience UI Framework component project.

```text
{{projectName}}/
  .mcp.json
  package.json
  now-ui.json
  src/
    {{componentName}}/
      index.js
      view.js
      styles.scss
    examples/
      index.js
    runtime/
      ui-core.js
      snabbdom.js
  example/
    element.js
```

Purpose of each part:

1. `now-ui.json` declares the public contract consumed by the platform and UI Builder.
2. `package.json` should declare instance-backed HDS packages under `optionalDependencies` with version `"instance"` when the project depends on platform components.
3. `src/{{componentName}}/index.js` registers the real custom element with `createCustomElement(...)`.
4. `src/{{componentName}}/view.js` contains the view function so the render path stays separate from registration.
5. `src/examples/index.js` is a dedicated smoke-test component for demo state and sample props.
6. `src/{{componentName}}/styles.scss` holds the component stylesheet, imported into the component and declared via `styles` in `createCustomElement(...)`.
7. `src/runtime/ui-core.js` and `src/runtime/snabbdom.js` are local framework shims.
8. `example/element.js` is the local entry point used by `snc ui-component develop`.

Minimal file pattern:

```js
// src/runtime/ui-core.js
import {servicenowUiCore} from '@servicenow/ui-mega';
export const {createCustomElement} = servicenowUiCore;
```

```js
// src/runtime/snabbdom.js
import {servicenowUiRendererSnabbdom} from '@servicenow/ui-mega';
export const {createElement} = servicenowUiRendererSnabbdom;
export default servicenowUiRendererSnabbdom.default || servicenowUiRendererSnabbdom;
```

```js
// src/{{componentName}}/view.js
import {createElement} from '../runtime/snabbdom';
import '@servicenow/now-card';

export default function view(state) {
  const {title = '{{label}}', status = 'OK'} = state.properties;

  return (
    <now-card className="status-card">
      <h3 className="status-card__title">{title}</h3>
      <p className="status-card__status">{status}</p>
    </now-card>
  );
}
```

For new components with no existing repo style, prefer the JSX scaffold and do not hand-write low-level `createElement(...)` trees unless the repo already uses that pattern.

```json
// package.json
{
  "optionalDependencies": {
    "@servicenow/now-card": "instance"
  }
}
```

```js
// src/{{componentName}}/index.js
import {createCustomElement} from '../runtime/ui-core';
import snabbdom from '../runtime/snabbdom';
import view from './view';
import styles from './styles.scss';

createCustomElement('{{elementTag}}', {
  renderer: {type: snabbdom},
  view,
  styles,
  properties: {
    title: {default: '{{label}}'},
    status: {default: 'OK'}
  }
});
```

```js
// src/examples/index.js
import '../{{componentName}}';

export default function renderExamples(container) {
  container.innerHTML = `
    <{{elementTag}}
      title="{{label}}"
      status="Healthy"
    ></{{elementTag}}>
  `;
}
```

```js
// example/element.js
import renderExamples from '../src/examples';

const mountNode = document.createElement('div');
document.body.appendChild(mountNode);
renderExamples(mountNode);
```

```json
// now-ui.json
{
  "scopeName": "{{scopeName}}",
  "components": {
    "{{elementTag}}": {
      "uiBuilder": {
        "label": "{{label}}",
        "description": "Shows a simple title and status value",
        "category": "primitives",
        "associatedTypes": [
          "global.core",
          "global.landing-page"
        ]
      },
      "properties": [
        {
          "name": "title",
          "label": "Title",
          "fieldType": "string",
          "required": false,
          "defaultValue": "{{label}}",
          "typeMetadata": {
            "schema": {
              "type": "string"
            }
          }
        },
        {
          "name": "status",
          "label": "Status",
          "fieldType": "string",
          "required": false,
          "defaultValue": "OK",
          "typeMetadata": {
            "schema": {
              "type": "string"
            }
          }
        }
      ],
      "actions": []
    }
  }
}
```

Rules for agents:

1. MUST NOT mount the production component directly from `example/element.js`; route through `src/examples/index.js`.
2. MUST NOT import `@servicenow/ui-core` or `@servicenow/ui-renderer-snabbdom` directly from the component source; use the local runtime shims. This is a required scaffold rule, not optional cleanup.
3. MUST keep `createCustomElement(...)` and `now-ui.json` aligned whenever properties or dispatched events change.
4. MUST use `search_instance_components` and `get_component_api` before building custom UI that might already exist as an HDS component. When a platform primitive like `now-card` exists, prefer it over a custom card implementation.
5. MUST import the matching package for any HDS component used in JSX, not only `now-card`. Example: `import '@servicenow/now-button';` or `import '@servicenow/now-card';` before rendering the element.
6. MUST keep component styles in a dedicated `.scss` file per component, import it, and declare it via the `styles` property in `createCustomElement(...)`; do not inline CSS in the view.
7. MUST NOT run `snc ui-component develop` or `deploy` as part of agent scaffolding; create the structure and let the user run the CLI.