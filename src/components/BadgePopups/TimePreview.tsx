import type { BadgePopupProps } from '@/components/Badge'

export function TimePreview({ row: _row }: BadgePopupProps) {
  return (
    <>
      TODO{' '}
      <a href='https://github.com/diffplug/gitcasso/issues/83' className='underline'>
        #83
      </a>
      : show the revision history of the comment
    </>
  )
}
