# next-ui-mcp

An MCP server for building ServiceNow **Now/Next Experience UI Framework**
(`@servicenow/ui-core`) components with AI coding agents.

> Unofficial, community-maintained project. Not affiliated with, endorsed by, or
> supported by ServiceNow.

## Why

Now/Next Experience UI Framework components have two parts that must stay in sync:
the component's actual source (`src/<name>/index.js`) and a separate manifest
(`now-ui.json`) declaring its properties and dispatched events. AI agents (and humans)
routinely edit one and forget the other — because nothing tells them the manifest
exists or needs to change. This server gives an agent:

- **`explain_now_ui_manifest`** — what `now-ui.json` is, and the sync rule, on demand.
- **`check_manifest_sync`** — a real diff between a component's actual code and its
  manifest entry, run after any create/edit, so drift gets caught and fixed immediately
  instead of accumulating silently.
- **`get_component_api`** — looks up the *real* API of a platform component (e.g.
  `now-button`, `now-input`) directly from the user's own ServiceNow instance, so an
  agent reaches for the actual component and its actual props/events instead of
  hand-rolling a custom equivalent. See [Instance access](#instance-access) below —
  the public npm packages for these are often older/incomplete, so this deliberately
  reads from the one place every ServiceNow developer already has legitimate access
  to: their own instance.

Plus a growing set of curated, genericized example components under `examples/`
showing real, correct patterns (see `examples/selectable-list`).

## Install

Add to your MCP client config (e.g. `.mcp.json` at your project root for Claude Code,
`.cursor/mcp.json` for Cursor):

```json
{
  "mcpServers": {
    "next-ui": {
      "command": "npx",
      "args": ["-y", "next-ui-mcp@latest"],
      "env": {
        "NEXT_UI_INSTANCE_URL": "https://your-instance.service-now.com",
        "NEXT_UI_INSTANCE_USER": "your-user",
        "NEXT_UI_INSTANCE_PASSWORD": "your-password"
      }
    }
  }
}
```

Scope it to your Now/Next Experience UI Framework project by putting that config file
in the project itself rather than your global/user config — it'll only be active when
that project is open.

## Instance access

`get_component_api` queries `sys_ux_lib_component` and its related child tables
(`sys_ux_lib_component_attr`, `sys_ux_lib_component_prop`, `sys_ux_lib_component_action`)
on **your own** ServiceNow instance via the standard Table API — the same system tables
that back UI Builder's component picker, readable by any account with ordinary admin/dev
access to that instance. It never touches ServiceNow's internal npm registry or any
ServiceNow-internal tooling, and it never bundles or redistributes component data — every
lookup is a live call to the instance you configure.

Credentials are read **only** from environment variables (`NEXT_UI_INSTANCE_URL` and
either `NEXT_UI_INSTANCE_TOKEN`, or `NEXT_UI_INSTANCE_USER` + `NEXT_UI_INSTANCE_PASSWORD`),
set in your MCP client's server config as shown above — never passed as a tool-call
argument, so they never appear in the LLM's visible context or in logs. If they aren't
set, `get_component_api` returns a clear error explaining what to configure; every other
tool works fine without them.

## Development

```bash
npm install
npm run build   # compile TypeScript -> dist/
npm run dev     # run directly from src/ via tsx, for local iteration
```

## Contributing

The manifest-sync checker currently covers `properties` and `dispatch()`-based events.
`actionHandlers` (inbound actions a component *responds to*) is best-effort — see the
comments in `src/lib/parseComponentSource.ts`. PRs improving coverage, and PRs adding
more curated `examples/`, are the main way this stays useful and current as the
framework evolves — this is meant to be centrally maintained in one place rather than
copy-pasted per project.

## License

MIT
