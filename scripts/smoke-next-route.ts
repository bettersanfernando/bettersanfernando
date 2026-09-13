import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import nextConfig from '../next.config.ts';

export function readNextRoute(route: string): string {
  const directory = join('src/app', route === '/' ? '' : route.slice(1));
  const page = join(directory, 'page.page.tsx');

  assert.ok(existsSync(page), `${route} must be an App Router page`);

  return readdirSync(directory)
    .filter(file => /\.tsx?$/.test(file))
    .map(file => readFileSync(join(directory, file), 'utf8'))
    .join('\n');
}

export async function assertNextRedirect(source: string, destination: string) {
  const redirects = await nextConfig.redirects?.();

  assert.ok(
    redirects?.some(
      redirect =>
        redirect.source === source &&
        redirect.destination === destination &&
        redirect.permanent === true
    ),
    `${source} must permanently redirect to ${destination}`
  );
}
