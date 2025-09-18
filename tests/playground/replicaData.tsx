import type { CommentTableRow } from '@/entrypoints/background'
import type { CommentSpot } from '@/lib/enhancer'
import type { GitHubIssueAppendSpot } from '@/lib/enhancers/github/GitHubIssueAppendEnhancer'
import type { GitHubPrSpot } from '@/lib/enhancers/github/GitHubPrEnhancer'

export interface RedditSpot extends CommentSpot {
  title: string
  subreddit: string
  type: 'REDDIT'
}

const withSpot = <T extends CommentSpot>(spot: T): T => spot

export const generateMockDrafts = (): CommentTableRow[] => [
  {
    isOpenTab: true,
    isSent: false,
    isTrashed: false,
    latestDraft: {
      content:
        'This PR addresses the memory leak issue reported in #1233. The problem was caused by event listeners not being properly disposed...',
      stats: {
        charCount: 245,
        codeBlocks: [
          { code: 'const listener = () => {}', language: 'typescript' },
          { code: 'element.removeEventListener()', language: 'javascript' },
          { code: 'dispose()', language: 'typescript' },
        ],
        images: [
          { url: 'https://example.com/image1.png' },
          { url: 'https://example.com/image2.png' },
        ],
        links: [
          { text: 'Issue #1233', url: 'https://github.com/microsoft/vscode/issues/1233' },
          { text: 'Documentation', url: 'https://docs.microsoft.com' },
        ],
      },
      time: Date.now() - 1000 * 60 * 30,
    },
    spot: withSpot({
      domain: 'github.com',
      number: 1234,
      slug: 'microsoft/vscode',
      title: "Fix memory leak in extension host (why is this so hard! It's been months!)",
      type: 'GH_PR',
      unique_key: '1',
    } satisfies GitHubPrSpot),
  },
  {
    isOpenTab: false,
    isSent: false,
    isTrashed: false,
    latestDraft: {
      content:
        "I've been using GitLens for years and it's absolutely essential for my workflow. The inline blame annotations are incredibly helpful when...",
      stats: {
        charCount: 180,
        codeBlocks: [],
        images: [],
        links: [
          {
            text: 'GitLens',
            url: 'https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens',
          },
        ],
      },
      time: Date.now() - 1000 * 60 * 60 * 2,
    },
    spot: withSpot({
      subreddit: 'programming',
      title: "Re: What's your favorite VS Code extension?",
      type: 'REDDIT',
      unique_key: '2',
    } satisfies RedditSpot),
  },
  {
    isOpenTab: true,
    isSent: false,
    isTrashed: false,
    latestDraft: {
      content:
        "When using useEffect with async functions, the cleanup function doesn't seem to be called correctly in certain edge cases...",
      stats: {
        charCount: 456,
        codeBlocks: [{ code: 'useEffect(() => { /* async code */ }, [])', language: 'javascript' }],
        images: [],
        links: [],
      },
      time: Date.now() - 1000 * 60 * 60 * 5,
    },
    spot: withSpot({
      domain: 'github.com',
      number: 5678,
      slug: 'facebook/react',
      title: 'Unexpected behavior with useEffect cleanup',
      type: 'GH_ISSUE_APPEND',
      unique_key: '3',
    } satisfies GitHubIssueAppendSpot),
  },
  {
    isOpenTab: false,
    isSent: true,
    isTrashed: false,
    latestDraft: {
      content:
        'LGTM! Just a few minor suggestions about the examples in the routing section. Consider adding more context about...',
      stats: {
        charCount: 322,
        codeBlocks: [],
        images: [
          { url: 'routing-diagram.png' },
          { url: 'example-1.png' },
          { url: 'example-2.png' },
          { url: 'architecture.png' },
        ],
        links: [
          { text: 'Routing docs', url: 'https://nextjs.org/docs/routing' },
          { text: 'Examples', url: 'https://github.com/vercel/next.js/tree/main/examples' },
          {
            text: 'Migration guide',
            url: 'https://nextjs.org/docs/app/building-your-application/upgrading',
          },
        ],
      },
      time: Date.now() - 1000 * 60 * 60 * 24,
    },
    spot: withSpot({
      domain: 'github',
      number: 9012,
      slug: 'vercel/next.js',
      title: 'Update routing documentation',
      type: 'GH_PR',
      unique_key: '4',
    } satisfies GitHubPrSpot),
  },
  {
    isOpenTab: true,
    isSent: false,
    isTrashed: true,
    latestDraft: {
      content:
        'This PR implements ESM support in worker threads as discussed in the last TSC meeting. The implementation follows...',
      stats: {
        charCount: 678,
        codeBlocks: [
          { code: 'import { Worker } from "worker_threads"', language: 'javascript' },
          { code: 'new Worker("./worker.mjs", { type: "module" })', language: 'javascript' },
          { code: 'import { parentPort } from "worker_threads"', language: 'javascript' },
          { code: 'interface WorkerOptions { type: "module" }', language: 'typescript' },
          { code: 'await import("./dynamic-module.mjs")', language: 'javascript' },
          { code: 'export default function workerTask() {}', language: 'javascript' },
          { code: 'const result = await workerPromise', language: 'javascript' },
        ],
        images: [{ alt: 'ESM Worker Architecture', url: 'worker-architecture.png' }],
        links: [
          {
            text: 'TSC Meeting Notes',
            url: 'https://github.com/nodejs/TSC/blob/main/meetings/2023-11-01.md',
          },
          { text: 'ESM Spec', url: 'https://tc39.es/ecma262/' },
          { text: 'Worker Threads docs', url: 'https://nodejs.org/api/worker_threads.html' },
          { text: 'Implementation guide', url: 'https://nodejs.org/api/esm.html' },
          { text: 'Related issue', url: 'https://github.com/nodejs/node/issues/30682' },
        ],
      },
      time: Date.now() - 1000 * 60 * 60 * 48,
    },
    spot: withSpot({
      domain: 'github.com',
      number: 3456,
      slug: 'nodejs/node',
      title: 'Add support for ESM in worker threads',
      type: 'GH_PR',
      unique_key: '5',
    } satisfies GitHubPrSpot),
  },
]
