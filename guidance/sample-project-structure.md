# Sample project structure

Use this as the baseline scaffold for a local Now/Next Experience UI Framework
component project. New projects use `next-ui-storybook` as the default
development and preview workflow.

Default the registered custom-element name to the project's scope name converted
to kebab-case, followed by the component name. For example, `scopeName:
x_snc_abc123` and `my-component` produce `x-snc-abc123-my-component`. Pass the
existing manifest's `scopeName` to `get_component_scaffold` and preserve that
original value in `now-ui.json`. Component folder names may remain unprefixed.

```text
{{projectName}}/
  .storybook/
    main.mjs
  package.json
  now-ui.json
  stories/
    {{componentName}}.stories.js
  src/
    {{componentName}}/
      index.js
      view.js
      styles.scss
    runtime/
      ui-core.js
      snabbdom.js
```

Purpose of each part:

1. `now-ui.json` declares the public contract consumed by the platform and UI Builder.
2. `package.json` should declare instance-backed HDS packages under `optionalDependencies` with version `"instance"` when the project depends on platform components.
3. `src/{{componentName}}/index.js` registers the real custom element with `createCustomElement(...)`.
4. `src/{{componentName}}/view.js` contains the view function so the render path stays separate from registration.
5. `src/{{componentName}}/styles.scss` holds the component stylesheet, imported into the component and declared via `styles` in `createCustomElement(...)`.
6. `src/runtime/ui-core.js` and `src/runtime/snabbdom.js` are local framework shims.
7. `.storybook/main.mjs` configures Storybook and the ServiceNow addon.
8. `stories/{{componentName}}.stories.js` imports and previews the registered component.

The Storybook addon requires Node.js 22 or newer and a ServiceNow instance for
instance-backed previews. Assume the user already has an `snc` profile
configured. Credential and profile configuration are the user's responsibility,
not part of agent scaffolding.

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
// package.json (merge these entries into the project manifest)
{
  "scripts": {
    "storybook": "storybook dev -p 6006"
  },
  "devDependencies": {
    "@dylanlindgren/next-ui-storybook-addon": "^1.0.0",
    "@storybook/web-components-vite": "^10.6.2",
    "react": "^18.3.1",
    "sass": "1.53.0",
    "storybook": "^10.6.2",
    "vite": "^7.3.6"
  }
}
```

Use the package manager and compatible versions already established by the
project where applicable. Do not replace the project's existing package
manifest or lockfile wholesale.

```js
// .storybook/main.mjs
/** @type {import('@storybook/web-components-vite').StorybookConfig} */
export default {
  framework: '@storybook/web-components-vite',
  stories: ['../stories/**/*.stories.@(js|jsx|mjs)'],
  addons: [
    {
      name: '@dylanlindgren/next-ui-storybook-addon',
      options: {
        componentSrcDir: 'src',
      },
    },
  ],
  core: { disableTelemetry: true },
};
```

```js
// stories/{{componentName}}.stories.js
import '../src/{{componentName}}';

const TAG = '{{elementTag}}';

export default {
  title: 'Components/{{label}}',
  tags: ['autodocs'],
  render: (args) => {
    const element = document.createElement(TAG);
    Object.assign(element, args);
    return element;
  },
  argTypes: {
    title: { control: 'text' },
    status: { control: 'text' },
  },
  args: {
    title: '{{label}}',
    status: 'Healthy',
  },
};

export const Default = {};
```

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

```json
// now-ui.json
{
  "scopeName": "{{scopeName}}",
  "components": {
    "{{elementTag}}": {
      "uiBuilder": {
        "label": "{{label}}",
        "tileIcon": "./tile-icon/generic-tile-icon.svg",
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

1. MUST use Storybook with `@dylanlindgren/next-ui-storybook-addon` as the default local component preview workflow. Create or update a story for each component being previewed.
2. MUST assess existing project configuration before setup or migration. Preserve compatible Storybook configuration, package scripts, lockfiles, existing stories, examples, and unrelated project instructions; make targeted additions instead of replacing files wholesale.
3. MUST NOT import `@servicenow/ui-core` or `@servicenow/ui-renderer-snabbdom` directly from the component source; use the local runtime shims. This is a required scaffold rule, not optional cleanup.
4. MUST keep `createCustomElement(...)` and `now-ui.json` aligned whenever properties or dispatched events change.
5. MUST include `uiBuilder.tileIcon` in every component's `now-ui.json` entry. Use `./tile-icon/generic-tile-icon.svg` by default; it is a project-root-relative path to the generic SVG already present in a newly set-up project. If a component needs a custom tile icon, create its SVG under the project root and use its root-relative `.svg` path.
6. MUST use `search_instance_components` and `get_component_api` before building custom UI that might already exist as an HDS component. When a platform primitive like `now-card` exists, prefer it over a custom card implementation.
7. MUST import the matching package for any HDS component used in JSX, not only `now-card`. Example: `import '@servicenow/now-button';` or `import '@servicenow/now-card';` before rendering the element.
8. MUST keep component styles in a dedicated `.scss` file per component, import it, and declare it via the `styles` property in `createCustomElement(...)`; do not inline CSS in the view.
9. MUST NOT use `snc ui-component develop` as the default preview workflow. Do not run `snc ui-component develop` or `deploy` as part of agent scaffolding or validation.
10. MUST NOT execute `pnpm storybook`, `storybook dev`, or equivalent commands that start the Storybook development server. Give the user the preview command to run themselves.