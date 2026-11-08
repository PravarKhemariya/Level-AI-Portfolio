import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { projects } from '../src/content/portfolio';

const dist = join(import.meta.dirname, '..', 'dist');

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const read = (path: string) => readFileSync(join(dist, path), 'utf8');
const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

beforeAll(() => {
  if (!existsSync(join(dist, 'index.html'))) {
    throw new Error('dist/ is missing. Run `npm test` (which builds first) or `npm run build`.');
  }
});

describe('built site', () => {
  it('builds the home page and one page per case study', () => {
    expect(existsSync(join(dist, 'index.html'))).toBe(true);
    for (const p of projects) expect(existsSync(join(dist, 'projects', p.slug, 'index.html'))).toBe(true);
  });

  it('marks every page noindex and asks crawlers to stay out', () => {
    for (const file of htmlFiles(dist)) {
      expect(readFileSync(file, 'utf8'), relative(dist, file)).toContain(
        '<meta name="robots" content="noindex, nofollow, noarchive">',
      );
    }
    expect(read('robots.txt')).toMatch(/User-agent: \*\s+Disallow: \//);
  });

  it('shows the review-draft notice on every page', () => {
    for (const file of htmlFiles(dist)) expect(readFileSync(file, 'utf8')).toContain('Review draft');
  });

  it('has exactly one h1 per page', () => {
    for (const file of htmlFiles(dist)) {
      expect(readFileSync(file, 'utf8').match(/<h1\b/g)?.length, relative(dist, file)).toBe(1);
    }
  });

  it('has no forms, sign-in, images, embeds or contact links', () => {
    for (const file of htmlFiles(dist)) {
      const html = readFileSync(file, 'utf8');
      expect(html).not.toMatch(/<(form|input|textarea|iframe|img|video|embed|object)\b/);
      expect(html).not.toMatch(/mailto:|tel:|linkedin|sign in|log in/i);
    }
  });

  it('renders no source-code buttons while sourceUrl is null', () => {
    for (const file of htmlFiles(dist)) {
      const html = readFileSync(file, 'utf8');
      expect(html).not.toMatch(/View source/);
      expect(html).not.toMatch(/gitlab|github\.com/i);
    }
  });

  it.each(projects)('$slug page links to its demos in a new tab, with the agreed labels', (project) => {
    const html = read(`projects/${project.slug}/index.html`);
    const external = anchors(html).filter((a) => attr(a, 'href')?.startsWith('http'));
    expect(external.map((a) => attr(a, 'href'))).toEqual(project.demos.map((d) => d.url));
    for (const a of external) {
      expect(attr(a, 'target')).toBe('_blank');
      expect(attr(a, 'rel')).toBe('noopener noreferrer');
    }
    for (const demo of project.demos) expect(html).toContain(demo.label);
    expect(html).toContain('opens in a new tab');
  });

  it('only links internally to pages that exist', () => {
    for (const file of htmlFiles(dist)) {
      for (const a of anchors(readFileSync(file, 'utf8'))) {
        const href = attr(a, 'href')!;
        if (href.startsWith('http')) continue;
        const path = href.split('#')[0];
        const target = path.endsWith('/') ? join(dist, path, 'index.html') : join(dist, path);
        expect(existsSync(target), `${relative(dist, file)} -> ${href}`).toBe(true);
      }
    }
  });

  it('keeps diagram icons hidden from assistive tech and captions every diagram', () => {
    for (const p of projects) {
      const html = read(`projects/${p.slug}/index.html`);
      for (const svg of html.match(/<svg\b[^>]*>/g) ?? []) expect(svg).toContain('aria-hidden="true"');
      expect(html).toContain('<figcaption');
    }
  });
});
