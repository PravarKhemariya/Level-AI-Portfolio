// Captures full-page desktop and mobile screenshots of the built site.
// Usage: npm run build && npm run screenshots [-- <output-dir>]
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { projects } from '../src/content/portfolio.ts';

const outDir = process.argv[2] ?? 'screenshots';
const port = 4329;
const origin = `http://localhost:${port}`;

const pages = [
  { name: 'home', path: '/' },
  ...projects.map((p) => ({ name: p.slug, path: `/projects/${p.slug}/` })),
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
];

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not start at ${url}`);
}

const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(port), '--ignore-lock'], {
  stdio: 'ignore',
});

try {
  await waitForServer(origin);
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile ?? false,
      deviceScaleFactor: vp.deviceScaleFactor ?? 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    for (const p of pages) {
      await page.goto(origin + p.path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const file = `${outDir}/${vp.name}-${p.name}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
    }
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
}
