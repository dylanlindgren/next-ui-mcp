import componentSchemaValidation from '@servicenow/component-schema-validation';

export type SchemaValidationIssue = {
  message: string;
  path?: string;
  component?: string;
  schemaLabel?: string;
  level?: string;
};

export type ValidateNowUiJsonResult = {
  valid: boolean;
  errors: SchemaValidationIssue[];
  warnings: SchemaValidationIssue[];
  raw: { ajv: unknown[]; custom: unknown[] };
};

function normalizeIssue(issue: unknown): SchemaValidationIssue | null {
  if (!issue || typeof issue !== 'object') {
    return null;
  }

  const record = issue as Record<string, unknown>;
  const message =
    typeof record.message === 'string'
      ? record.message
      : typeof record.keyword === 'string'
        ? `Schema validation failed for keyword "${record.keyword}".`
        : 'Schema validation failed.';

  return {
    message,
    path: typeof record.path === 'string' ? record.path : typeof record.dataPath === 'string' ? record.dataPath : undefined,
    component: typeof record.component === 'string' ? record.component : undefined,
    schemaLabel: typeof record.schemaLabel === 'string' ? record.schemaLabel : undefined,
    level: typeof record.level === 'string' ? record.level : undefined
  };
}

export function validateNowUiJson(input: unknown): ValidateNowUiJsonResult {
  const baseResult: ValidateNowUiJsonResult = {
    valid: false,
    errors: [],
    warnings: [],
    raw: { ajv: [], custom: [] }
  };

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      ...baseResult,
      errors: [{ message: 'Expected a now-ui.json object with a components map.' }]
    };
  }

  const manifest = input as Record<string, unknown>;
  const components = manifest.components;

  if (!components || typeof components !== 'object' || Array.isArray(components)) {
    return {
      ...baseResult,
      errors: [{ message: 'Expected a top-level "components" object inside now-ui.json.' }]
    };
  }

  const raw = componentSchemaValidation(manifest as Record<string, unknown>);
  const ajvIssues = Array.isArray(raw?.ajv) ? raw.ajv : [];
  const customIssues = Array.isArray(raw?.custom) ? raw.custom : [];
  const issues = [...ajvIssues, ...customIssues]
    .map((issue) => normalizeIssue(issue))
    .filter((issue): issue is SchemaValidationIssue => issue !== null && issue.message.length > 0);

  const warnings = issues.filter((issue) => (issue.level ?? '').toLowerCase() === 'warning' || (issue.level ?? '').toLowerCase() === 'warn');
  const errors = issues.filter((issue) => !warnings.includes(issue));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    raw: { ajv: ajvIssues, custom: customIssues }
  };
}
