import { describe, expect, it } from 'vitest';
import { CONTRIBUTION, projects, site } from '../src/content/portfolio';

const EXPECTED_DEMOS: Record<string, string[]> = {
  'handoff-briefing': [
    'https://aa-prototype.vercel.app/replica.html',
    'https://va-aa-handover-config-demo.vercel.app/demo/assistant/demo-assistant/deployment/live-agent-assist',
  ],
  'live-notes': ['https://aa-prototype.vercel.app/live-notes'],
  'chat-drafts': ['https://aa-realtime-suggestions-proto.vercel.app/chat-replica.html'],
};

const allText = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allText);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allText);
  return [];
};

describe('site', () => {
  it('uses the agreed hero content', () => {
    expect(site.name).toBe('Pravar Khemariya');
    expect(site.intro).toBe('Exploring better ways for AI and human support agents to work together.');
    expect(site.focus).toBe('AI-assisted support workflows');
  });

  it('has no resume, contact or social links until supplied', () => {
    expect(site.profileLinks).toEqual([]);
  });
});

describe('projects', () => {
  it('has exactly the three case studies, in order', () => {
    expect(projects.map((p) => p.slug)).toEqual(['handoff-briefing', 'live-notes', 'chat-drafts']);
  });

  it.each(projects)('$slug links to exactly its approved demos', (project) => {
    expect(project.demos.map((d) => d.url)).toEqual(EXPECTED_DEMOS[project.slug]);
  });

  it('uses a distinct CTA label for every demo', () => {
    const labels = projects.flatMap((p) => p.demos.map((d) => d.label));
    expect(new Set(labels).size).toBe(labels.length);
  });

  it.each(projects)('$slug is labelled as a prototype with contribution wording', (project) => {
    expect(project.status.label).toBe('Prototype');
    expect(project.contribution).toBe(CONTRIBUTION);
    expect(CONTRIBUTION).toBe('Contributed to the project and prototype.');
  });

  it.each(projects)('$slug has no source link until one is approved', (project) => {
    expect(project.sourceUrl).toBeNull();
  });

  it.each(projects)('$slug states an intended benefit and explicit limits', (project) => {
    expect(project.intendedBenefit.length).toBeGreaterThan(0);
    expect(project.notClaimed.length).toBeGreaterThan(0);
  });
});

describe('claims guardrails', () => {
  const text = allText({ site, projects }).join('\n');

  it('contains no statistics or percentages', () => {
    expect(text).not.toMatch(/\d+(\.\d+)?\s?%|\b\d+x\b/i);
  });

  it('avoids ownership, leadership and seniority claims', () => {
    expect(text).not.toMatch(/\b(led|owned|spearheaded|drove|headed|senior|lead product|principal)\b/i);
  });

  it('avoids outcome and launch claims', () => {
    expect(text).not.toMatch(/\b(increased|improved by|reduced by|launched|rolled out|in production at|customers love)\b/i);
  });

  it('does not describe the demos as tested', () => {
    expect(text).not.toMatch(/\btested\b/i);
  });

  it('contains no contact details', () => {
    expect(text).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}|mailto:|linkedin|\+?\d[\d\s-]{8,}\d/i);
  });

  it('only links to the approved demo hosts', () => {
    const urls = text.match(/https?:\/\/[^\s'"]+/g) ?? [];
    const allowed = Object.values(EXPECTED_DEMOS).flat();
    for (const url of urls) expect(allowed).toContain(url);
  });
});
