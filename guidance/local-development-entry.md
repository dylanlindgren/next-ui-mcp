# Local development with next-ui-storybook

`@dylanlindgren/next-ui-storybook-addon` and Storybook are the default local
development and preview workflow for projects guided by this MCP server.
`snc ui-component develop` is not the default workflow.

## New projects

For a new project, use `get_component_scaffold` and include the Storybook
configuration, component story, and package scripts shown there. Tell the user
to start the interactive preview with `pnpm storybook` (or the equivalent
package-manager script). Agents MUST NOT execute `pnpm storybook`, `storybook
dev`, or any equivalent command that starts the Storybook development server.
Starting that server is the user's responsibility. A static preview can be
created with `pnpm build-storybook`.

Stories should import the component source so the component registers, then
render its custom-element tag with representative property args. Keep framework
component code and `now-ui.json` as the source of truth; Storybook is the local
preview surface, not a replacement for the manifest or platform build.

The addon expects the project root as its working directory and
`componentSrcDir: 'src'` for the default scaffold. It compiles framework JSX
and SCSS, resolves instance modules, and provides the theme and authenticated
development-proxy integrations.

## Existing projects

Before changing local-development setup, inspect the project's package
manifest, Storybook configuration, stories, scripts, and agent instructions.
If the project already uses a compatible `next-ui-storybook` setup, keep it
and extend the existing configuration only as needed.

Otherwise, guide the project onto `next-ui-storybook` as its default:

1. Add the Storybook framework and `@dylanlindgren/next-ui-storybook-addon` to
   the project's development dependencies, following the toolkit's documented
   compatible versions and the project's package manager.
2. Add `.storybook/main.mjs` using `@storybook/web-components-vite` and
   `@dylanlindgren/next-ui-storybook-addon`, with the correct component source
   directory.
3. Add a story for the component being developed. Do not remove or rewrite
   unrelated stories.
4. Add or preserve `storybook` and `build-storybook` scripts, integrating
   with existing scripts rather than replacing the package manifest.
5. Preserve existing examples, `example/element.js`, and any platform CLI
   workflow when the project uses them for another purpose; they are no longer
   the default local preview path.
6. Explain any required setup and give the user the project's Storybook
   command to run themselves. Do not start the Storybook development server.
   Do not claim the instance-backed preview works without verifying it.

The toolkit requires Node.js 22 or newer. Check the project's runtime before
adopting it; do not silently change an existing supported-runtime contract.
Explain the incompatibility and ask before making a breaking runtime change.

Do not overwrite custom Storybook configuration, package-manager settings, or
agent instructions. Make the smallest compatible changes and report any
incompatibility that needs the developer's decision.

## Instance credentials

Instance credentials are the user's responsibility. Assume the user already
has an `snc` profile configured and let the toolkit use that existing profile.
Agents MUST NOT request, read, copy, or configure credentials, create credential
environment files, or modify the user's `snc` profiles as part of Storybook
setup. If authentication or profile configuration is missing, report the
limitation and leave resolution to the user.

## Scope

The addon provides an instance-backed development and preview environment.
It does not replace manifest validation, framework guidance, component API
discovery, or platform deployment. Do not run `snc ui-component develop` or
`snc ui-component deploy` as a substitute for the Storybook workflow or as an
agent validation step.
