# Local development entry

For local development, agents should treat ./example/element.js as the entry point used by snc ui-component develop.

This refers to the user's component project, not the example files bundled inside this MCP package.

Expected project pattern:

1. Keep an example entry at ./example/element.js.
2. Create a dedicated examples component for the project and import it into that element.js file.
3. Import the real component source into the examples component so the smoke-test view exercises the same registration path as production code.
4. Render the examples component from element.js using innerHTML so the component can be exercised immediately in local development.

Do not stop at a bare example/element.js file that mounts the production custom element directly. The examples component is a required part of the scaffold because it is the safe place for demo state, sample props, and multi-component smoke tests.

Agents should not invoke `snc ui-component develop` themselves to validate this scaffold. Their job is to create the expected files and wiring; the user can run the project CLI afterward.

Why this matters:

- It gives agents a predictable place to wire up a smoke-test view.
- It keeps demonstration markup separate from the component source under src/.
- It makes local verification easier while iterating with snc ui-component develop.