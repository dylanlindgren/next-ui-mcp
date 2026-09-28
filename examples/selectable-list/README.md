# Pattern: selectable list (radio-group emitting a selection event)

A component that renders a list of options as a radio-group and dispatches a single
namespaced event when the user picks one. It takes no action *in*, only emits one action *out*.

Shows the three things every Now/Next Experience UI Framework component needs to get right
together:

1. **`properties`** in `createCustomElement(...)` (index.js) — the component's inputs.
2. **`dispatch(EVENT_NAME, payload)`** — the component's only way to talk to the outside world.
3. **`now-ui.json`** — the manifest declaring both of the above, so other tooling and other
   developers can discover this component's API without reading its source.

See `index.js` and `now-ui.json` side by side. Use `check_manifest_sync` after copying this
pattern for your own component to confirm the two stayed in sync.
