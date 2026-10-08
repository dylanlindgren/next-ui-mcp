# Get component scaffold guidance

Use `get_component_scaffold` for a new ServiceNow UI component project when the repo has no existing custom-element style to preserve.

## Required output

The scaffold must include:

- `src/runtime/ui-core.js`
- `src/runtime/snabbdom.js`
- `src/<component-name>/index.js`
- `src/<component-name>/view.js`
- `src/<component-name>/styles.scss`
- `src/examples/index.js`
- `example/element.js`
- `now-ui.json`

## Required rules

1. Prefer JSX for new projects.
2. Use `className`, never `class`.
3. Use local runtime shims backed by `@servicenow/ui-mega`. The shims must import `servicenowUiCore` and `servicenowUiRendererSnabbdom` from that package, as shown in the scaffold. Neither component source nor shim files may import or re-export from `@servicenow/ui-core` or `@servicenow/ui-renderer-snabbdom`; merely wrapping those original packages in local files is not compliant.
4. Prefer an existing HDS component such as `now-card` before creating a custom card or wrapper.
5. If you use any HDS component in JSX, import the matching package, for example `import '@servicenow/now-card';`.
6. Keep styles in a separate `.scss` file and set them via the `styles` property on `createCustomElement(...)`.
7. Keep `createCustomElement(...)` and `now-ui.json` aligned whenever properties or external actions change.

## Example requirement

The generated scaffold should look like a standard ServiceNow component project, not a hand-written DOM tree with inline style blocks.

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
