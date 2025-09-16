import type { OverTypeInstance } from 'overtype'
import type { ReactNode } from 'react'
import type { CommentEnhancer, CommentSpot } from '../enhancer'

/** Used when an entry is in the table which we don't recognize. */
export class CommentEnhancerMissing implements CommentEnhancer {
  tableUpperDecoration(spot: CommentSpot): ReactNode {
    return (
      <button
        type='button'
        className='relative inline-block border-none bg-transparent p-0 text-left cursor-pointer underline'
        style={{
          display: 'inline-block',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          const popup = e.currentTarget.querySelector('.popup') as HTMLElement
          if (popup) popup.style.display = 'block'
        }}
        onMouseLeave={(e) => {
          const popup = e.currentTarget.querySelector('.popup') as HTMLElement
          if (popup) popup.style.display = 'none'
        }}
      >
        hover for json
        <div
          className='popup absolute top-full left-0 bg-gray-100 border border-gray-300 rounded shadow-lg p-2 z-50 min-w-[320px]'
          style={{ display: 'none' }}
        >
          <pre className='m-0 text-xs font-mono select-text cursor-text whitespace-pre-wrap break-words'>
            {JSON.stringify(spot, null, 2)}
          </pre>
        </div>
      </button>
    )
  }
  tableTitle(spot: CommentSpot): string {
    return `Unknown type '${spot.type}'`
  }
  forSpotTypes(): string[] {
    throw new Error('Method not implemented.')
  }
  tryToEnhance(_textarea: HTMLTextAreaElement): CommentSpot | null {
    throw new Error('Method not implemented.')
  }
  prepareForFirstEnhancement(): void {
    throw new Error('Method not implemented.')
  }
  enhance(_textarea: HTMLTextAreaElement, _spot: CommentSpot): OverTypeInstance {
    throw new Error('Method not implemented.')
  }
}
