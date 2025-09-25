import type { BadgePopupProps } from '@/components/Badge'

export function TextPreview({ row: _row }: BadgePopupProps) {
  return (
    <>
      TODO{' '}
      <a href='https://github.com/diffplug/gitcasso/issues/82' className='underline'>
        #82
      </a>
      : show the syntax-highlighted markdown of the latest draft
    </>
  )
}
