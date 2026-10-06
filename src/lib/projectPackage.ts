import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getHdsComponent, HDS_COMPONENTS } from './hdsComponentRegistry.js';

export interface ProjectDependencyAnalysis {
  packageJsonPath: string;
  instanceOptionalDependencies: string[];
  regularServiceNowDependencies: Array<{ name: string; version: string; section: string }>;
  missingInstanceDependencies: string[];
  shouldMoveToInstanceOptional: string[];
}

type PackageJsonShape = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

function isNowExperiencePackage(name: string): boolean {
  return name.startsWith('@servicenow/now-') || HDS_PACKAGE_NAMES.has(name);
}

const HDS_PACKAGE_NAMES = new Set(HDS_COMPONENTS.map((component) => component.packageName));

export function packageNameForTag(componentTag: string): string {
  const normalizedTag = componentTag.trim();

  if (!normalizedTag) {
    return '';
  }

  if (normalizedTag.startsWith('@')) {
    return normalizedTag;
  }

  const knownPackage = getHdsComponent(normalizedTag)?.packageName;
  if (knownPackage) {
    return knownPackage;
  }

  return '';
}

export async function analyzeProjectDependencies(
  packageJsonPath: string,
  plannedComponentTags: string[] = []
): Promise<ProjectDependencyAnalysis> {
  const resolvedPath = resolve(packageJsonPath);
  const raw = await readFile(resolvedPath, 'utf8');
  const parsed = JSON.parse(raw) as PackageJsonShape;

  const dependencies = parsed.dependencies ?? {};
  const devDependencies = parsed.devDependencies ?? {};
  const optionalDependencies = parsed.optionalDependencies ?? {};

  const instanceOptionalDependencies = Object.entries(optionalDependencies)
    .filter(([name, version]) => isNowExperiencePackage(name) && version === 'instance')
    .map(([name]) => name)
    .sort();

  const regularServiceNowDependencies = [
    ...Object.entries(dependencies).map(([name, version]) => ({ name, version, section: 'dependencies' })),
    ...Object.entries(devDependencies).map(([name, version]) => ({ name, version, section: 'devDependencies' })),
    ...Object.entries(optionalDependencies).map(([name, version]) => ({ name, version, section: 'optionalDependencies' }))
  ]
    .filter(({ name, version }) => isNowExperiencePackage(name) && version !== 'instance')
    .sort((left, right) => left.name.localeCompare(right.name));

  const normalizedPlannedPackages = plannedComponentTags
    .map((tag) => packageNameForTag(tag.trim()))
    .filter(Boolean)
    .sort();

  const missingInstanceDependencies = normalizedPlannedPackages.filter(
    (packageName) => optionalDependencies[packageName] !== 'instance'
  );

  const shouldMoveToInstanceOptional = normalizedPlannedPackages.filter((packageName) => {
    const inDependencies = packageName in dependencies;
    const inDevDependencies = packageName in devDependencies;
    const inOptionalDependencies = packageName in optionalDependencies && optionalDependencies[packageName] !== 'instance';
    return inDependencies || inDevDependencies || inOptionalDependencies;
  });

  return {
    packageJsonPath: resolvedPath,
    instanceOptionalDependencies,
    regularServiceNowDependencies,
    missingInstanceDependencies,
    shouldMoveToInstanceOptional
  };
}