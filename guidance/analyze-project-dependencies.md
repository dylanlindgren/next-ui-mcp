# Analyze project dependencies

Use `analyze_project_dependencies` to review a project's `package.json` and determine whether platform components should be declared as instance-backed `optionalDependencies`.

## Purpose

This tool catches the common mistake where an agent uses a ServiceNow HDS component in JSX but forgets to declare the matching package in `optionalDependencies` with version `"instance"`.

## Required rule

If a project uses an HDS component that is instance-backed, the package should appear like this:

```json
{
  "optionalDependencies": {
    "@servicenow/now-card": "instance",
    "@servicenow/now-badge": "instance"
  }
}
```

## When to use it

- before committing to a project that depends on instance-backed ServiceNow platform components
- when using `--fa` workflows
- when the project references HDS packages that might only exist on the target instance

## Explain the decision

The analysis should distinguish between:

- public npm packages that are safe to keep as standard dependencies
- instance-backed platform packages that must be declared as `optionalDependencies` with version `"instance"`

The tool should tell the agent which packages are missing and which ones should be moved to the instance-backed form.
