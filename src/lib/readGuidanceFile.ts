import { readFileSync } from 'node:fs';

export function readGuidanceFile(name: string): string {
  return readFileSync(new URL(`../../guidance/${name}.md`, import.meta.url), 'utf8');
}