import OverType from 'overtype'
import type React from 'react'
import type {
  CommentEnhancer,
  CommentSpot,
  OvertypeWithCleanup,
  StrippedLocation,
} from '@/lib/enhancer'
import { logger } from '@/lib/logger'
import { modifyDOM } from '../modifyDOM'
import { commonGitHubOptions, prepareGitHubHighlighter } from './github-common'

const GH_PR_APPEND = 'GH_PR_APPEND' as const

export interface GitHubPrAppendSpot extends CommentSpot {
  type: typeof GH_PR_APPEND
  title: string
  domain: string
  slug: string // owner/repo
  number: number // issue/PR number, undefined for new issues and PRs
}

export class GitHubPrAppendEnhancer implements CommentEnhancer<GitHubPrAppendSpot> {
  forSpotTypes(): string[] {
    return [GH_PR_APPEND]
  }

  tryToEnhance(
    textarea: HTMLTextAreaElement,
    location: StrippedLocation,
  ): GitHubPrAppendSpot | null {
    // Only handle github.com domains TODO: identify GitHub Enterprise somehow
    if (location.host !== 'github.com' || textarea.id !== 'new_comment_field') {
      return null
    }

    // Parse GitHub URL structure: /owner/repo/issues/123 or /owner/repo/pull/456
    logger.debug(`${this.constructor.name} examing url`, location.pathname)

    const match = location.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/pull\/(\d+))/)
    logger.debug(`${this.constructor.name} found match`, location.pathname)
    if (!match) return null
    const [, owner, repo, numberStr] = match
    const slug = `${owner}/${repo}`
    const number = parseInt(numberStr!, 10)
    const unique_key = `github.com:${slug}:${number}`
    const title = document
      .querySelector('main h1')!
      .textContent.replace(/\s*#\d+$/, '')
      .trim()
    return {
      domain: location.host,
      number,
      slug,
      title,
      type: GH_PR_APPEND,
      unique_key,
    }
  }

  enhance(textArea: HTMLTextAreaElement, _spot: GitHubPrAppendSpot): OvertypeWithCleanup {
    prepareGitHubHighlighter()
    const overtypeContainer = modifyDOM(textArea)
    const instance = new OverType(overtypeContainer, {
      ...commonGitHubOptions,
      minHeight: '102px',
      padding: 'var(--base-size-8)',
      placeholder: 'Add your comment here...',
    })[0]!
    console.log('C')
    textArea.addEventListener('input', () => {
      if (textArea.value === '') {
        console.log('input event fired')
        instance.updatePreview()
      }
    })
    const observer = new MutationObserver(() => {
      if (textArea.value === '') {
        console.log('MutationObserver fired')
        instance.updatePreview()
      }
    })
    observer.observe(textArea, { attributes: true, characterData: true })
    const cleanup = () => {
      OverType.instances.delete(overtypeContainer)
      ;(overtypeContainer as any).overTypeInstance = undefined
    }
    return {
      cleanup,
      instance,
    }
  }

  tableUpperDecoration(spot: GitHubPrAppendSpot): React.ReactNode {
    const { slug, number } = spot
    return (
      <>
        <span className='font-mono text-muted-foreground text-sm'>{slug}</span>
        <span className='ml-2 font-medium'>PR #{number}</span>
      </>
    )
  }

  tableTitle(spot: GitHubPrAppendSpot): string {
    return spot.title
  }
}
