# Level-AI-Portfolio

Product management portfolio for **Pravar Khemariya** about AI-assisted support workflows, showing
contributions to three Level AI prototype projects.

> **Status: private review draft.** Not deployed anywhere. Do not publish until every item under
> [Pending confirmations](#pending-confirmations) is resolved.

## Stack

- [Astro](https://astro.build) static site: one HTML page per route, no client-side framework, no backend.
- Self-hosted fonts via Fontsource (Newsreader, Inter), so pages make no third-party requests.
- Vitest for content and build-output checks, Playwright + axe for accessibility checks and screenshots.

Requires Node `>=22.23.4`.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321 with live reload
```

To preview the production build:

```bash
npm run build
npm run preview    # serves dist/ at http://localhost:4321
```

## Checks

```bash
npm test                 # builds, then runs content + built-output tests
npm run check            # Astro / TypeScript type check
npm run test:a11y        # axe scan of every page at 1440px and 390px (needs a build)
npm run screenshots      # full-page desktop + mobile PNGs into ./screenshots (needs a build)
```

Playwright needs a browser the first time: `npx playwright install --with-deps chromium`.

## Routes

| Route | Content |
| --- | --- |
| `/` | Hero, themes, three case-study cards, review notes (draft only) |
| `/projects/handoff-briefing/` | Making AI-to-human handoffs feel like a continuation |
| `/projects/live-notes/` | Keeping critical call details within reach |
| `/projects/chat-drafts/` | Helping chat agents start with a relevant draft |

## Editing content

All copy lives in one typed file: [`src/content/portfolio.ts`](src/content/portfolio.ts).

- `site`: name, intro, themes, `draft` flag, `profileLinks`, `reviewNotes`.
- `projects`: each case study's problem, approach, what the prototype shows, intended benefit,
  explicit limits (`notClaimed`), demo links, `sourceUrl`, and the workflow diagram.

The workflow diagrams are generated from `diagram.steps`, so they are real text that reflows on
mobile. They are original, generic illustrations; they are not screenshots of the prototypes.

### Content rules

These are enforced by `tests/content.test.ts`:

- Involvement is worded as "Contributed to the project and prototype." No ownership, leadership,
  seniority, job titles or invented responsibilities.
- Benefits are *intended* benefits. No statistics, measured outcomes, launch or production claims.
- Demos are described as prototypes and are not called "tested".
- Only the approved demo URLs appear. Demos are linked externally (new tab), never embedded.
- No contact details, resume, social links, testimonials, client names or dates.
- No screenshots of the demos and no raw PRDs, conversations or internal material as assets.

### Adding a source link later

Each project has `sourceUrl: string | null`. It is `null` for all three because the candidate
repositories are private and their mapping to the deployments is unconfirmed. While it is `null`,
no source button renders. Once a link is approved for sharing and confirmed to match the deployment,
set `sourceUrl` and a "View source" link appears in that case study's demo section. Update the
`sourceUrl` assertion in `tests/content.test.ts` at the same time.

### Adding resume / contact / social links later

Add entries to `site.profileLinks` (`{ label, url }`); they render in the footer. Leave it empty
until the links are supplied, and relax the matching assertions in the tests when you do.

### Leaving draft mode

Set `site.draft = false` to hide the review banner and the review-notes box. The `noindex` meta tag
and `public/robots.txt` stay in place regardless; remove them deliberately when publishing. They only
ask crawlers not to index the site and are **not** access control.

## Pending confirmations

Confirm before any release:

- [ ] Employer permission to show these Level AI projects publicly.
- [ ] Pravar's actual responsibilities on each project. Copy currently says only that he contributed.
- [ ] Demo behaviour. All four demo pages were reachable, but their interactions have not been
      verified in a browser.
- [ ] Source links. Candidate repositories are private and the repository-to-deployment mapping is
      unconfirmed, so `sourceUrl` is `null` everywhere.
- [ ] Live notes case study: the linked demo shows the live-notes surface only; the related custom
      post-call summary exploration is mentioned as context but is not shown.
- [ ] Resume, contact and social links, if any should be added.

Out of scope for this draft: the desktop app, self-serve summaries, checklist and knowledge projects.
