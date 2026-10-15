# Get component scaffold guidance

Use `get_component_scaffold` for a new ServiceNow UI component project when
the repo has no existing custom-element style to preserve. The scaffold uses
`next-ui-storybook` as the default local preview workflow.

## Required output

The scaffold must include:

- `src/runtime/ui-core.js`
- `src/runtime/snabbdom.js`
- `src/<component-name>/index.js`
- `src/<component-name>/view.js`
- `src/<component-name>/styles.scss`
- `.storybook/main.mjs`
- `stories/<component-name>.stories.js`
- package scripts for `storybook` and `build-storybook`
- `now-ui.json`

## Required rules

1. Prefer JSX for new projects.
2. Use `className`, never `class`.
3. Use local runtime shims backed by `@servicenow/ui-mega`. The shims must import `servicenowUiCore` and `servicenowUiRendererSnabbdom` from that package, as shown in the scaffold. Neither component source nor shim files may import or re-export from `@servicenow/ui-core` or `@servicenow/ui-renderer-snabbdom`; merely wrapping those original packages in local files is not compliant.
4. Prefer an existing HDS component such as `now-card` before creating a custom card or wrapper.
5. If you use any HDS component in JSX, import the matching package, for example `import '@servicenow/now-card';`.
6. Keep styles in a separate `.scss` file and set them via the `styles` property on `createCustomElement(...)`.
7. Keep `createCustomElement(...)` and `now-ui.json` aligned whenever properties or external actions change.
8. Read `scopeName` from the project's `now-ui.json` and pass it to `get_component_scaffold`. Default custom-element names to the kebab-case scope followed by the component name: scope `x_snc_abc123` and component `my-component` produce `x-snc-abc123-my-component`. Preserve `x_snc_abc123` as the manifest's scope value. Do not add the prefix again if the name already includes it.

## Storybook requirement

The generated scaffold should configure
`@dylanlindgren/next-ui-storybook-addon` and
`@storybook/web-components-vite`, and include a story that imports the
component source and renders its custom-element tag with representative args.
The project should be previewable with its `storybook` script and buildable
with `build-storybook`.

When adding Storybook to an existing project, inspect the package manifest,
scripts, Storybook config, stories, and instructions first. Preserve compatible
configuration and unrelated files; make targeted changes rather than replacing
the project setup wholesale. Keep existing example files when they serve other
workflows, but do not treat them as the default local preview path.

The generated component itself should look like a standard ServiceNow component
project, not a hand-written DOM tree with inline style blocks.

The generated JSX should look like:

```js
return (
  <now-card className="status-card">
    <h3 className="status-card__title">{title}</h3>
  </now-card>
);
```

and not:

```js
return createElement('div', { class: 'status-card' });
```
