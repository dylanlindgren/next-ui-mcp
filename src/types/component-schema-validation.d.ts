declare module '@servicenow/component-schema-validation' {
  export type ValidationIssue = {
    message?: string;
    path?: string;
    dataPath?: string;
    component?: string;
    schemaLabel?: string;
    level?: string;
    keyword?: string;
  };

  export type ValidationResult = {
    ajv: ValidationIssue[];
    custom: ValidationIssue[];
  };

  const validate: (uxfConfig: Record<string, unknown>) => ValidationResult;

  export default validate;
}
