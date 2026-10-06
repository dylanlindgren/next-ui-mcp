# Instance-backed platform dependencies

Public npm packages for @servicenow/now-* components can be out of date or incomplete compared with what exists on a real instance.

When a component exists on the target instance, declare it in package.json as an optionalDependency with version "instance".

Example:

```json
{
  "optionalDependencies": {
    "@servicenow/now-button": "instance"
  }
}
```

All components should use local shims for @servicenow/ui-core and @servicenow/ui-renderer-snabbdom so the ui-component plugin does not auto-inject its public npm copies. Treat those shim files as required project scaffolding.

Expected shim pattern:

1. Create src/runtime/ui-core.js and re-export createCustomElement from @servicenow/ui-mega.
2. Create src/runtime/snabbdom.js and re-export createElement and the default renderer from @servicenow/ui-mega.
3. Update component source to import from those local runtime files instead of directly from @servicenow/ui-core or @servicenow/ui-renderer-snabbdom.
4. Keep the component-package import separate from the runtime shim import: import the actual component package or tag-specific module for the widget you want to use, and import createElement/snabbdom only from the local runtime shim.

A project that uses optionalDependencies with version "instance", but still imports the framework packages directly and lacks these runtime shim files, is not fully configured.

Agents should not run `snc ui-component develop` or `snc ui-component deploy` themselves to verify this. Their responsibility is to wire the shims and dependencies correctly so the user can run the CLI afterward.

Example:

```js
import {createCustomElement} from '../runtime/ui-core';
import {createElement} from '../runtime/snabbdom';
import snabbdom from '../runtime/snabbdom';

// src/runtime/ui-core.js
import {servicenowUiCore} from '@servicenow/ui-mega';
export const {createCustomElement} = servicenowUiCore;

// src/runtime/snabbdom.js
import {servicenowUiRendererSnabbdom} from '@servicenow/ui-mega';
export const {createElement} = servicenowUiRendererSnabbdom;
export default servicenowUiRendererSnabbdom.default || servicenowUiRendererSnabbdom;
```

When you need a platform component itself, use the component's package import directly
(for example `import '@servicenow/now-button';`). The runtime shim is only for the
framework helpers, not for the platform component package.

Tradeoff: agents lose direct access to raw source under node_modules, but they gain access to the current component library actually available on that instance and avoid framework auto-injection conflicts in normal develop/deploy workflows.