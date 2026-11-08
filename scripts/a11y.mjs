// Runs axe accessibility checks against the built site at desktop and mobile widths.
// Usage: npm run build && npm run test:a11y
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { projects } from '../src/content/portfolio.ts';

const port = 4331;
const origin = `http://localhost:${port}`;
const paths = ['/', ...projects.map((p) => `/projects/${p.slug}/`), '/missing-page/'];

const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(port), '--ignore-lock'], {
  stdio: 'ignore',
});

let failures = 0;
try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(origin)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  const browser = await chromium.launch();
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const path of paths) {
      await page.goto(origin + path, { waitUntil: 'networkidle' });
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();
      failures += violations.length;
      console.log(`${width}px ${path}: ${violations.length} violation(s)`);
      for (const v of violations) {
        console.log(`  - ${v.id}: ${v.help} (${v.nodes.length})`);
        for (const n of v.nodes) console.log(`      ${n.target.join(" ")} ${n.any[0]?.message ?? ""}`);
      }
    }
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
}
process.exit(failures ? 1 : 0);
