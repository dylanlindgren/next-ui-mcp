import { access } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

/** Walks upward from a component directory looking for the project's now-ui.json. */
export async function findManifestPath(startDir: string): Promise<string | null> {
  let dir = startDir;
  for (let i = 0; i < 8; i++) {
    const candidate = join(dir, 'now-ui.json');
    try {
      await access(candidate);
      return candidate;
    } catch {
      const parent = dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  }
  return null;
}

/** now-ui.json keys components by their directory's basename (e.g. src/select-number -> "select-number"). */
export function componentNameFromDir(componentDir: string): string {
  return basename(componentDir);
}
