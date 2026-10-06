# now-ui.json in a Now/Next Experience UI Framework component project

now-ui.json is the machine-readable manifest for every custom component in this project. It sits alongside src/ at the project root and is keyed by component directory name:

```text
  {
    "components": {
      "<component-directory-name>": {
        "properties": [ { "name", "label", "fieldType", "defaultValue", "description", ... } ],
        "actions":    [ { "name", "label", "description", "payload": [...] } ],
        "uiBuilder":  { "label", "icon", "description", "category" }
      }
    }
  }
```

It is NOT derived automatically from the component's index.js — it is a separate, hand-maintained (or tool-maintained) declaration that other tooling (UI Builder and the platform) reads to know a component's public API, without executing the component's JavaScript.

## The rule

Entries passed to `properties` in the component's `createCustomElement(name, { properties: {...} })` should have matching objects (same "name") in that component's "properties" array in now-ui.json when those properties are part of the public contract that ServiceNow tooling or external consumers are expected to use.

Event names passed to `dispatch(name, payload)` should have matching objects (same "name") in that component's "actions" array in now-ui.json when those events are part of the public contract that ServiceNow tooling or external consumers are expected to listen to.

## When to act

Whenever you create a new component, or add/remove/rename a publicly exposed property or dispatched event on an existing one, update both files in the same change. Treat the manifest as part of the same edit, not a follow-up task.