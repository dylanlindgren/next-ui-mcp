import { readGuidanceFile } from './readGuidanceFile.js';

function normalizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function startCaseFromKebab(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(' ');
}

export type ComponentScaffoldOptions = {
  componentName?: string;
  elementPrefix?: string;
  scopeName?: string;
};

const SCAFFOLD_TEMPLATE = readGuidanceFile('sample-project-structure');

function renderTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => values[key] ?? '');
}

export function renderComponentScaffold(options: ComponentScaffoldOptions = {}): string {
  const componentName = normalizeSegment(options.componentName ?? 'my-component') || 'my-component';
  const scopeName = normalizeSegment(options.scopeName ?? options.elementPrefix ?? 'my-scope') || 'my-scope';
  const elementPrefix = normalizeSegment(options.elementPrefix ?? scopeName) || scopeName;
  const projectName = `${componentName}-project`;
  const elementTag = `${elementPrefix}-${componentName}`;
  const label = startCaseFromKebab(componentName);

  return renderTemplate(SCAFFOLD_TEMPLATE, {
    componentName,
    projectName,
    elementTag,
    label,
    scopeName,
    elementPrefix
  });
}