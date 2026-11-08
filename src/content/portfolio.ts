/**
 * Central, editable content model for the portfolio.
 *
 * Wording rules for anything added here (see README "Content rules"):
 * - Describe participation as contribution, never sole ownership or leadership.
 * - Describe outcomes as *intended* benefits; no measured results or statistics.
 * - Do not claim a prototype shipped, was tested, or runs on production AI.
 * - Only add `sourceUrl` / profile links once they are approved and verified.
 */

export type StepKind = 'ai' | 'customer' | 'artifact' | 'human' | 'config' | 'outcome';

export interface FlowStep {
  kind: StepKind;
  /** Who or what this node represents, e.g. "AI agent". */
  actor: string;
  title: string;
  items?: string[];
  /** Secondary node rendered beneath this step (e.g. an admin setup that feeds it). */
  support?: {
    kind: StepKind;
    actor: string;
    title: string;
    items?: string[];
    /** Short label on the dashed connector between support node and step. */
    relation: string;
  };
}

export interface FlowDiagram {
  /** Accessible name for the diagram. */
  label: string;
  caption: string;
  steps: FlowStep[];
}

export interface DemoLink {
  /** Visible call-to-action; must be unique across the site. */
  label: string;
  url: string;
  /** Which part of the prototype the demo shows. */
  surface: string;
}

export interface Project {
  slug: string;
  number: string;
  title: string;
  /** One-sentence summary used on the home page card. */
  summary: string;
  status: {
    label: 'Prototype';
    scope: string;
  };
  contribution: string;
  problem: string[];
  approach: {
    intro: string;
    points: string[];
  };
  /** Optional related work that is mentioned but not shown in the demos. */
  related?: string;
  prototypeShows: string[];
  intendedBenefit: string;
  /** Explicit limits on what this case study claims. */
  notClaimed: string[];
  demos: DemoLink[];
  /**
   * Link to source code. Keep `null` until a link is approved for sharing and
   * verified to correspond to the linked deployment. No button renders while null.
   */
  sourceUrl: string | null;
  diagram: FlowDiagram;
}

export interface ProfileLink {
  label: string;
  url: string;
}

export interface Site {
  name: string;
  descriptor: string;
  focus: string;
  intro: string;
  organization: string;
  /** Shows the review banner and review notes; also keeps noindex metadata on. */
  draft: boolean;
  /** Resume, contact and social links. Intentionally empty until supplied. */
  profileLinks: ProfileLink[];
  themes: { title: string; body: string }[];
  /** Items that must be confirmed before release. Rendered only while `draft` is true. */
  reviewNotes: string[];
}

export const CONTRIBUTION = 'Contributed to the project and prototype.';

export const site: Site = {
  name: 'Pravar Khemariya',
  descriptor: 'Product management portfolio',
  focus: 'AI-assisted support workflows',
  intro: 'Exploring better ways for AI and human support agents to work together.',
  organization: 'Level AI',
  draft: true,
  profileLinks: [],
  themes: [
    {
      title: 'Context should travel',
      body: 'When work moves between an AI agent and a person, what is already known should move with it.',
    },
    {
      title: 'Details within reach',
      body: 'The facts an agent needs for the next step belong next to the conversation, not buried in it.',
    },
    {
      title: 'People stay in control',
      body: 'Suggestions can lighten the load, while the agent still decides what the customer sees.',
    },
  ],
  reviewNotes: [
    'Employer permission to show these projects publicly.',
    'Actual responsibilities on each project; wording currently says only that Pravar contributed.',
    'Demo pages were reachable, but their interactions have not been verified in a browser.',
    'Source repositories are private and their mapping to the deployments is unconfirmed, so no source links are shown.',
  ],
};

export const projects: Project[] = [
  {
    slug: 'handoff-briefing',
    number: '01',
    title: 'Making AI-to-human handoffs feel like a continuation',
    summary:
      'A structured briefing so the human agent who picks up an escalated conversation sees why it was transferred, what matters, and what has already been done.',
    status: { label: 'Prototype', scope: 'Agent experience + admin setup' },
    contribution: CONTRIBUTION,
    problem: [
      'When an AI agent escalates a conversation to a human, the transfer often arrives without the reason for the handoff, the relevant context, or a record of the actions already completed.',
      'The customer ends up repeating themselves, and the human agent has to reconstruct the situation before they can help.',
    ],
    approach: {
      intro: 'A structured agent briefing, paired with an admin configuration for shaping it.',
      points: [
        'The briefing states why the conversation was transferred.',
        'It brings forward the context relevant to the request.',
        'It lists the actions already taken, so nobody has to ask for them again.',
        'In admin setup, teams tailor what the brief contains and preview the result.',
      ],
    },
    prototypeShows: [
      'The agent-facing view of a handoff brief.',
      'An admin setup for tailoring and previewing the brief.',
    ],
    intendedBenefit:
      'Reduce how often customers have to repeat themselves, and help agents choose the next step.',
    notClaimed: [
      'This is a prototype; it is not presented as shipped.',
      'No channel coverage or release timing is implied.',
      'No measured outcomes are reported.',
    ],
    demos: [
      {
        label: 'Open the agent briefing demo',
        url: 'https://aa-prototype.vercel.app/replica.html',
        surface: 'Agent experience',
      },
      {
        label: 'Open the admin setup demo',
        url: 'https://va-aa-handover-config-demo.vercel.app/demo/assistant/demo-assistant/deployment/live-agent-assist',
        surface: 'Admin setup',
      },
    ],
    sourceUrl: null,
    diagram: {
      label: 'Handoff briefing workflow',
      caption:
        'An AI agent escalates; a brief shaped in admin setup carries the reason, context and completed actions to the human agent, who continues from there.',
      steps: [
        {
          kind: 'ai',
          actor: 'AI agent',
          title: 'Escalates the conversation',
        },
        {
          kind: 'artifact',
          actor: 'Agent brief',
          title: 'Carries the situation forward',
          items: ['Transfer reason', 'Relevant context', 'Actions already taken'],
          support: {
            kind: 'config',
            actor: 'Admin setup',
            title: 'Tailor the brief',
            items: ['Choose what it includes', 'Preview before use'],
            relation: 'shapes',
          },
        },
        {
          kind: 'human',
          actor: 'Human agent',
          title: 'Continues, not restarts',
          items: ['Chooses the next step'],
        },
      ],
    },
  },
  {
    slug: 'live-notes',
    number: '02',
    title: 'Keeping critical call details within reach',
    summary:
      'A dedicated live-notes surface beside the conversation, so exact facts and evolving lists are not lost in the transcript.',
    status: { label: 'Prototype', scope: 'Live-notes surface' },
    contribution: CONTRIBUTION,
    problem: [
      'On a live call, exact facts, such as figures, names and items in a list that keeps changing, get buried in the transcript.',
      'Generic call summaries tend to miss the workflow-specific facts an agent actually needs for follow-up.',
    ],
    approach: {
      intro: 'A dedicated live-notes surface that sits alongside the conversation.',
      points: [
        'Critical details get their own place next to the conversation instead of being scattered through it.',
        'The surface is designed so exact facts and evolving lists stay in view while the call continues.',
      ],
    },
    related:
      'A related frontend exploration looked at a custom post-call summary. It is not shown in the linked demo, so it is mentioned here only as context.',
    prototypeShows: ['A live-notes surface presented alongside a conversation.'],
    intendedBenefit: 'More complete follow-up and fewer repeated questions.',
    notClaimed: [
      'No automatic extraction of details is claimed.',
      'No persistence, CRM write-back, admin configuration or integrations are implied.',
      'The custom post-call summary screen is not part of the linked demo.',
    ],
    demos: [
      {
        label: 'Open the live notes demo',
        url: 'https://aa-prototype.vercel.app/live-notes',
        surface: 'Live-notes surface',
      },
    ],
    sourceUrl: null,
    diagram: {
      label: 'Live notes workflow',
      caption:
        'The conversation continues on one side while a dedicated notes surface keeps exact facts and evolving lists in view, ready for follow-up.',
      steps: [
        {
          kind: 'customer',
          actor: 'Live call',
          title: 'Conversation unfolds',
          items: ['Facts surface mid-call', 'Lists change over time'],
        },
        {
          kind: 'artifact',
          actor: 'Live notes',
          title: 'Details kept within reach',
          items: ['Exact facts', 'Evolving lists'],
          support: {
            kind: 'config',
            actor: 'Related exploration',
            title: 'Custom post-call summary',
            items: ['Frontend only', 'Not in the linked demo'],
            relation: 'related',
          },
        },
        {
          kind: 'human',
          actor: 'Agent',
          title: 'Follows up',
          items: ['Fewer repeated questions'],
        },
      ],
    },
  },
  {
    slug: 'chat-drafts',
    number: '03',
    title: 'Helping chat agents start with a relevant draft',
    summary:
      'Each customer turn offers a small set of contextual drafts that the agent chooses from, edits and sends themselves.',
    status: { label: 'Prototype', scope: 'Frontend interactive prototype' },
    contribution: CONTRIBUTION,
    problem: [
      'In live chat, writing each reply from scratch, and looking up knowledge to do it, slows the agent down while the customer waits.',
    ],
    approach: {
      intro: 'Contextual draft suggestions triggered by each customer turn.',
      points: [
        'A new customer turn brings up a small set of contextual drafts.',
        'The agent chooses one, edits it as needed, and sends it manually.',
        'As the chat moves on, earlier suggestions are replaced with ones that fit the latest turn.',
      ],
    },
    prototypeShows: ['A frontend, interactive chat prototype with draft suggestions.'],
    intendedBenefit: 'Reduce drafting effort while keeping the agent in control of what is sent.',
    notClaimed: [
      'This is a frontend prototype; it is not presented as running on production AI.',
      'No knowledge grounding, accuracy, adoption or speed claims are made.',
    ],
    demos: [
      {
        label: 'Open the chat drafts demo',
        url: 'https://aa-realtime-suggestions-proto.vercel.app/chat-replica.html',
        surface: 'Chat agent experience',
      },
    ],
    sourceUrl: null,
    diagram: {
      label: 'Chat draft suggestions workflow',
      caption:
        'A customer turn brings up a few contextual drafts; the agent picks, edits and sends one manually, and the suggestions refresh as the chat moves on.',
      steps: [
        {
          kind: 'customer',
          actor: 'Customer',
          title: 'Sends a message',
        },
        {
          kind: 'ai',
          actor: 'Suggestions',
          title: 'A few contextual drafts',
          items: ['Draft A', 'Draft B', 'Draft C'],
          support: {
            kind: 'config',
            actor: 'As the chat moves on',
            title: 'Suggestions are replaced',
            items: ['Fit the latest turn'],
            relation: 'refresh',
          },
        },
        {
          kind: 'human',
          actor: 'Agent',
          title: 'Chooses, edits, sends',
          items: ['Sent manually'],
        },
      ],
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
